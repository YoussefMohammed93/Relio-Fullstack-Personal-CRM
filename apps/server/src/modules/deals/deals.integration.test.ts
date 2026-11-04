import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";
import { it } from "node:test";
import { env } from "../../config/env.js";
import { connectDatabase } from "../../database/connect.js";
import {
  Activity,
  Company,
  Contact,
  Deal,
  DealHistory,
  PipelineStage,
  Task,
  User,
} from "../../database/models/index.js";
import { app } from "../../app.js";
import { signSessionToken } from "../auth/auth.tokens.js";

function cookieFor(user: { _id: mongoose.Types.ObjectId; sessionVersion: number }) {
  return `relio_session=${signSessionToken({ sub: String(user._id), sv: user.sessionVersion })}`;
}

async function request(
  baseUrl: string,
  path: string,
  cookie?: string,
  init: { method?: string; body?: unknown } = {},
) {
  return fetch(`${baseUrl}${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
}

it(
  "enforces Deal ownership and lifecycle rules over HTTP",
  { skip: process.env.RELIO_DEALS_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;
    let otherOwnerId: mongoose.Types.ObjectId | undefined;
    const server = createServer(app);

    try {
      const owner = await User.create({
        username: `deal-${token.slice(0, 12)}`,
        email: `deal-${token}@example.test`,
      });
      ownerId = owner._id;
      const otherOwner = await User.create({
        username: `other-${token.slice(0, 12)}`,
        email: `other-deal-${token}@example.test`,
      });
      otherOwnerId = otherOwner._id;
      const ownerCookie = cookieFor(owner);
      const otherCookie = cookieFor(otherOwner);
      const company = await Company.create({
        owner: ownerId,
        name: `Company ${token}`,
      });
      const otherCompany = await Company.create({
        owner: otherOwnerId,
        name: `Other ${token}`,
      });
      const contact = await Contact.create({
        owner: ownerId,
        firstName: "Avery",
        lastName: "Moss",
        email: `avery-${token}@example.test`,
        company: company._id,
      });
      const otherContact = await Contact.create({
        owner: otherOwnerId,
        firstName: "Riley",
        lastName: "Other",
      });
      const [newStage, qualifiedStage, proposalStage, customStage] =
        await PipelineStage.create([
          {
            owner: ownerId,
            name: "New",
            color: "#64748b",
            defaultProbability: 10,
            order: 0,
          },
          {
            owner: ownerId,
            name: "Qualified",
            color: "#0ea5e9",
            defaultProbability: 25,
            order: 1,
          },
          {
            owner: ownerId,
            name: "Proposal",
            color: "#2563eb",
            defaultProbability: 50,
            order: 2,
          },
          {
            owner: ownerId,
            name: "Custom",
            color: "#f59e0b",
            defaultProbability: null,
            order: 3,
          },
        ]);

      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

      assert.equal((await request(baseUrl, "/deals")).status, 401);
      const missingCustomProbability = await request(baseUrl, "/deals", ownerCookie, {
        method: "POST",
        body: {
          name: "Needs a probability",
          value: 500,
          primaryContact: String(contact._id),
          pipelineStage: String(customStage._id),
        },
      });
      assert.equal(missingCustomProbability.status, 400);

      const foreignContact = await request(baseUrl, "/deals", ownerCookie, {
        method: "POST",
        body: {
          name: "Foreign contact",
          value: 500,
          primaryContact: String(otherContact._id),
          pipelineStage: String(newStage._id),
        },
      });
      assert.equal(foreignContact.status, 404);
      const foreignCompany = await request(baseUrl, "/deals", ownerCookie, {
        method: "POST",
        body: {
          name: "Foreign company",
          value: 500,
          primaryContact: String(contact._id),
          company: String(otherCompany._id),
          pipelineStage: String(newStage._id),
        },
      });
      assert.equal(foreignCompany.status, 404);

      const createResponse = await request(baseUrl, "/deals", ownerCookie, {
        method: "POST",
        body: {
          name: "Website redesign",
          value: 2500,
          primaryContact: String(contact._id),
          pipelineStage: String(newStage._id),
          expectedCloseDate: "2026-12-01",
        },
      });
      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as {
        data: {
          id: string;
          probability: number;
          company: { id: string } | null;
          pipelineStage: { id: string; defaultProbability: number | null };
        };
      };
      const dealId = new mongoose.Types.ObjectId(created.data.id);
      assert.equal(created.data.probability, 10);
      assert.equal(created.data.company?.id, String(company._id));
      assert.equal(created.data.pipelineStage.defaultProbability, 10);

      const manualProbabilityResponse = await request(baseUrl, "/deals", ownerCookie, {
        method: "POST",
        body: {
          name: "Custom stage opportunity",
          value: 800,
          primaryContact: String(contact._id),
          pipelineStage: String(customStage._id),
          probability: 40,
        },
      });
      assert.equal(manualProbabilityResponse.status, 201);
      const manualProbabilityDeal = (await manualProbabilityResponse.json()) as {
        data: { id: string; probability: number };
      };
      assert.equal(manualProbabilityDeal.data.probability, 40);
      const customStageMove = await request(
        baseUrl,
        `/deals/${manualProbabilityDeal.data.id}`,
        ownerCookie,
        { method: "PATCH", body: { pipelineStage: String(customStage._id) } },
      );
      assert.equal(customStageMove.status, 200);
      assert.equal(
        ((await customStageMove.json()) as { data: { probability: number } }).data
          .probability,
        40,
      );

      const stageResponse = await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
        method: "PATCH",
        body: { pipelineStage: String(proposalStage._id) },
      });
      assert.equal(stageResponse.status, 200);
      assert.equal(
        ((await stageResponse.json()) as { data: { probability: number } }).data
          .probability,
        50,
      );
      const valueResponse = await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
        method: "PATCH",
        body: { value: 3000 },
      });
      assert.equal(valueResponse.status, 200);

      const dealTask = await Task.create({
        owner: ownerId,
        title: `Prepare ${token}`,
        relatedEntityType: "Deal",
        relatedEntityId: dealId,
      });
      const sharedActivity = await Activity.create({
        owner: ownerId,
        type: "note",
        title: `Shared note ${token}`,
        contact: contact._id,
        deal: dealId,
        activityDate: new Date(),
      });
      await Activity.create({
        owner: ownerId,
        type: "call",
        title: `Contact call ${token}`,
        contact: contact._id,
        activityDate: new Date(),
      });

      const activities = await request(
        baseUrl,
        `/deals/${dealId}/activities`,
        ownerCookie,
      );
      assert.equal(activities.status, 200);
      const activityRows = (await activities.json()) as {
        data: { id: string; source: string }[];
      };
      assert.equal(activityRows.data.length, 2);
      assert.equal(
        activityRows.data.find((activity) => activity.id === String(sharedActivity._id))
          ?.source,
        "Deal and Primary Contact",
      );
      const tasks = await request(baseUrl, `/deals/${dealId}/tasks`, ownerCookie);
      assert.equal(
        ((await tasks.json()) as { data: { id: string }[] }).data[0]?.id,
        String(dealTask._id),
      );

      const list = await request(
        baseUrl,
        "/deals?search=redesign&status=open&sortBy=value&sortDirection=desc&page=1&limit=5",
        ownerCookie,
      );
      assert.equal(list.status, 200);
      assert.equal(((await list.json()) as { meta: { total: number } }).meta.total, 1);
      const stats = await request(baseUrl, "/deals/stats", ownerCookie);
      assert.equal(
        ((await stats.json()) as { data: { activeDeals: number } }).data.activeDeals,
        2,
      );
      assert.equal(
        (await request(baseUrl, `/deals/${dealId}`, otherCookie)).status,
        404,
      );
      assert.equal(
        (
          await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
            method: "PATCH",
            body: { company: String(otherCompany._id) },
          })
        ).status,
        404,
      );

      const wonResponse = await request(baseUrl, `/deals/${dealId}/won`, ownerCookie, {
        method: "POST",
        body: {},
      });
      assert.equal(wonResponse.status, 200);
      const won = (await wonResponse.json()) as {
        data: { status: string; finalValue: number; actualCloseDate: string };
      };
      assert.equal(won.data.status, "won");
      assert.equal(won.data.finalValue, 3000);
      assert.ok(won.data.actualCloseDate);
      assert.equal(
        (
          await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
            method: "PATCH",
            body: { pipelineStage: String(newStage._id) },
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
            method: "PATCH",
            body: { value: 3100 },
          })
        ).status,
        400,
      );
      const reopenResponse = await request(
        baseUrl,
        `/deals/${dealId}/reopen`,
        ownerCookie,
        { method: "POST", body: {} },
      );
      const reopened = (await reopenResponse.json()) as {
        data: { status: string; pipelineStage: { id: string }; actualCloseDate: null };
      };
      assert.equal(reopenResponse.status, 200);
      assert.equal(reopened.data.status, "open");
      assert.equal(reopened.data.pipelineStage.id, String(proposalStage._id));
      assert.equal(reopened.data.actualCloseDate, null);

      const lostResponse = await request(
        baseUrl,
        `/deals/${dealId}/lost`,
        ownerCookie,
        {
          method: "POST",
          body: { lostReason: "competitor" },
        },
      );
      const lost = (await lostResponse.json()) as {
        data: { status: string; lostReason: string; lostDate: string };
      };
      assert.equal(lostResponse.status, 200);
      assert.equal(lost.data.status, "lost");
      assert.equal(lost.data.lostReason, "competitor");
      assert.ok(lost.data.lostDate);

      const bulkStage = await request(baseUrl, "/deals/bulk-stage", ownerCookie, {
        method: "POST",
        body: {
          ids: [manualProbabilityDeal.data.id],
          pipelineStage: String(qualifiedStage._id),
        },
      });
      assert.equal(bulkStage.status, 200);
      assert.equal(
        ((await bulkStage.json()) as { data: { changedCount: number } }).data
          .changedCount,
        1,
      );

      const history = await request(baseUrl, `/deals/${dealId}/history`, ownerCookie);
      const historyRows = (await history.json()) as {
        data: { eventType: string }[];
      };
      assert.deepEqual(
        historyRows.data.map(({ eventType }) => eventType).sort(),
        ["created", "lost", "reopened", "stage_changed", "value_changed", "won"].sort(),
      );

      const deleteResponse = await request(baseUrl, `/deals/${dealId}`, ownerCookie, {
        method: "DELETE",
        body: {},
      });
      assert.equal(deleteResponse.status, 200);
      assert.equal(await Deal.exists({ _id: dealId, owner: ownerId }), null);
      assert.equal(
        await DealHistory.countDocuments({ deal: dealId, owner: ownerId }),
        0,
      );
      const unlinkedTask = await Task.findById(dealTask._id).lean();
      assert.equal(unlinkedTask?.relatedEntityType, null);
      assert.equal(unlinkedTask?.relatedEntityId, null);
      const unlinkedActivity = await Activity.findById(sharedActivity._id).lean();
      assert.equal(unlinkedActivity?.deal, null);
      assert.ok(unlinkedActivity?.contact?.equals(contact._id));
    } finally {
      server.closeAllConnections();
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
      if (ownerId) {
        await Promise.all([
          DealHistory.deleteMany({ owner: ownerId }),
          Task.deleteMany({ owner: ownerId }),
          Activity.deleteMany({ owner: ownerId }),
          Deal.deleteMany({ owner: ownerId }),
          PipelineStage.deleteMany({ owner: ownerId }),
          Contact.deleteMany({ owner: ownerId }),
          Company.deleteMany({ owner: ownerId }),
          User.deleteOne({ _id: ownerId }),
        ]);
      }
      if (otherOwnerId) {
        await Promise.all([
          Contact.deleteMany({ owner: otherOwnerId }),
          Company.deleteMany({ owner: otherOwnerId }),
          User.deleteOne({ _id: otherOwnerId }),
        ]);
      }
      await mongoose.disconnect();
    }
  },
);
