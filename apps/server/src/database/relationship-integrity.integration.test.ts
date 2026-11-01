import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { it } from "node:test";

import mongoose from "mongoose";

import { env } from "../config/env.js";
import { connectDatabase } from "./connect.js";
import {
  Activity,
  Company,
  Contact,
  Deal,
  DealHistory,
  PipelineStage,
  Task,
  User,
} from "./models/index.js";
import { relationshipIntegrity } from "./relationship-integrity.js";

it(
  "applies relationship deletion policies in MongoDB transactions",
  { skip: process.env.RELIO_DB_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;

    try {
      const owner = await User.create({
        username: `int-${token}`,
        email: `relio-integration-${token}@example.test`,
        firstName: "Database",
        lastName: "Integration",
      });
      ownerId = owner._id;

      const [stage, replacementStage] = await PipelineStage.create([
        {
          owner: ownerId,
          name: "Integration Source",
          color: "#2563eb",
          order: 0,
        },
        {
          owner: ownerId,
          name: "Integration Replacement",
          color: "#059669",
          order: 1,
        },
      ]);
      const company = await Company.create({
        owner: ownerId,
        name: `Integration Company ${token}`,
      });
      const contact = await Contact.create({
        owner: ownerId,
        firstName: "Casey",
        lastName: "Example",
        contactType: "lead",
        company: company._id,
      });
      const deal = await Deal.create({
        owner: ownerId,
        name: `Integration Deal ${token}`,
        value: 100,
        primaryContact: contact._id,
        company: company._id,
        pipelineStage: stage._id,
        previousStage: stage._id,
      });
      const task = await Task.create({
        owner: ownerId,
        title: `Integration Task ${token}`,
        relatedEntityType: "Contact",
        relatedEntityId: contact._id,
      });
      const contactActivity = await Activity.create({
        owner: ownerId,
        type: "note",
        title: `Contact Activity ${token}`,
        contact: contact._id,
        activityDate: new Date(),
      });
      const companyActivity = await Activity.create({
        owner: ownerId,
        type: "note",
        title: `Company Activity ${token}`,
        company: company._id,
        activityDate: new Date(),
      });
      const dealHistory = await DealHistory.create({
        owner: ownerId,
        deal: deal._id,
        eventType: "created",
      });

      await relationshipIntegrity.deleteContact(ownerId, contact._id);
      assert.equal(await Contact.exists({ _id: contact._id }), null);
      assert.equal(await Task.exists({ _id: task._id }), null);
      assert.equal(await Activity.exists({ _id: contactActivity._id }), null);
      assert.ok(await Activity.exists({ _id: companyActivity._id }));
      assert.ok(await DealHistory.exists({ _id: dealHistory._id }));
      assert.equal((await Deal.findById(deal._id))?.primaryContact, null);

      await relationshipIntegrity.deleteCompany(ownerId, company._id);
      assert.equal(await Company.exists({ _id: company._id }), null);
      assert.ok(await Activity.exists({ _id: companyActivity._id }));
      assert.equal((await Deal.findById(deal._id))?.company, null);

      await assert.rejects(
        relationshipIntegrity.deletePipelineStage(ownerId, stage._id),
        /replacement stage/,
      );
      await relationshipIntegrity.deletePipelineStage(
        ownerId,
        stage._id,
        replacementStage._id,
      );
      const reassignedDeal = await Deal.findById(deal._id);
      assert.equal(String(reassignedDeal?.pipelineStage), String(replacementStage._id));
      assert.equal(String(reassignedDeal?.previousStage), String(replacementStage._id));
      assert.equal(await PipelineStage.exists({ _id: stage._id }), null);
    } finally {
      if (ownerId) {
        await Promise.all([
          Activity.deleteMany({ owner: ownerId }),
          Company.deleteMany({ owner: ownerId }),
          Contact.deleteMany({ owner: ownerId }),
          Deal.deleteMany({ owner: ownerId }),
          DealHistory.deleteMany({ owner: ownerId }),
          PipelineStage.deleteMany({ owner: ownerId }),
          Task.deleteMany({ owner: ownerId }),
          User.deleteOne({ _id: ownerId }),
        ]);
      }
      await mongoose.disconnect();
    }
  },
);
