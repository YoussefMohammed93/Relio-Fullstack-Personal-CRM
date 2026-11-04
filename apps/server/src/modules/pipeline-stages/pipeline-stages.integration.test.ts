import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";
import { it } from "node:test";
import { env } from "../../config/env.js";
import { connectDatabase } from "../../database/connect.js";
import { Contact, Deal, PipelineStage, User } from "../../database/models/index.js";
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
  "manages owner-scoped pipeline stages and reassigns deals before deletion",
  { skip: process.env.RELIO_PIPELINE_STAGES_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;
    let otherOwnerId: mongoose.Types.ObjectId | undefined;
    const server = createServer(app);

    try {
      const owner = await User.create({
        username: `stage-${token.slice(0, 12)}`,
        email: `stage-${token}@example.test`,
      });
      ownerId = owner._id;
      const otherOwner = await User.create({
        username: `other-${token.slice(0, 12)}`,
        email: `other-stage-${token}@example.test`,
      });
      otherOwnerId = otherOwner._id;
      const ownerCookie = cookieFor(owner);
      const otherCookie = cookieFor(otherOwner);

      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

      assert.equal((await request(baseUrl, "/pipeline-stages")).status, 401);
      const defaultResponse = await request(baseUrl, "/pipeline-stages", ownerCookie);
      assert.equal(defaultResponse.status, 200);
      const defaults = (await defaultResponse.json()) as {
        data: { id: string; name: string; order: number; isDefault: boolean }[];
      };
      assert.deepEqual(
        defaults.data.map(({ name, order, isDefault }) => [name, order, isDefault]),
        [
          ["New", 0, true],
          ["Qualified", 1, true],
          ["Proposal", 2, true],
          ["Negotiation", 3, true],
        ],
      );
      assert.equal(
        (await request(baseUrl, "/pipeline-stages", otherCookie)).status,
        200,
      );
      assert.equal(await PipelineStage.countDocuments({ owner: otherOwnerId }), 4);

      const createResponse = await request(baseUrl, "/pipeline-stages", ownerCookie, {
        method: "POST",
        body: { name: "Discovery", color: "#15803d" },
      });
      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as {
        data: { id: string; order: number };
      };
      assert.equal(created.data.order, 4);
      const newStageId = new mongoose.Types.ObjectId(created.data.id);

      const invalidColor = await request(baseUrl, "/pipeline-stages", ownerCookie, {
        method: "POST",
        body: { name: "Invalid", color: "blue" },
      });
      assert.equal(invalidColor.status, 400);

      const renameResponse = await request(
        baseUrl,
        `/pipeline-stages/${defaults.data[0].id}`,
        ownerCookie,
        { method: "PATCH", body: { name: "Inbound" } },
      );
      assert.equal(renameResponse.status, 200);
      const renamed = (await renameResponse.json()) as { data: { name: string } };
      assert.equal(renamed.data.name, "Inbound");

      const foreignStageUpdate = await request(
        baseUrl,
        `/pipeline-stages/${defaults.data[0].id}`,
        otherCookie,
        { method: "PATCH", body: { name: "Private" } },
      );
      assert.equal(foreignStageUpdate.status, 404);

      const reorderIds = [
        newStageId,
        ...defaults.data.map(({ id }) => new mongoose.Types.ObjectId(id)),
      ];
      const reorderResponse = await request(
        baseUrl,
        "/pipeline-stages/reorder",
        ownerCookie,
        {
          method: "POST",
          body: { stageIds: reorderIds.map(String) },
        },
      );
      assert.equal(reorderResponse.status, 200);
      const reordered = (await reorderResponse.json()) as {
        data: { id: string; order: number }[];
      };
      assert.deepEqual(
        reordered.data.map(({ id, order }) => [id, order]),
        reorderIds.map((id, order) => [String(id), order]),
      );

      const contact = await Contact.create({
        owner: ownerId,
        firstName: "Demo",
        lastName: "Client",
        email: `contact-${token}@example.test`,
      });
      const deal = await Deal.create({
        owner: ownerId,
        name: `Stage Reassignment ${token}`,
        value: 500,
        primaryContact: contact._id,
        pipelineStage: newStageId,
        previousStage: newStageId,
      });
      const noReplacement = await request(
        baseUrl,
        `/pipeline-stages/${newStageId}`,
        ownerCookie,
        { method: "DELETE", body: {} },
      );
      assert.equal(noReplacement.status, 400);
      assert.ok(await PipelineStage.exists({ _id: newStageId, owner: ownerId }));

      const invalidReplacement = await request(
        baseUrl,
        `/pipeline-stages/${newStageId}`,
        ownerCookie,
        { method: "DELETE", body: { replacementStageId: String(defaults.data[0].id) } },
      );
      assert.equal(invalidReplacement.status, 200);
      const reassigned = await Deal.findById(deal._id);
      assert.equal(String(reassigned?.pipelineStage), defaults.data[0].id);
      assert.equal(String(reassigned?.previousStage), defaults.data[0].id);

      const deleteLastStage = await request(
        baseUrl,
        `/pipeline-stages/${defaults.data[1].id}`,
        otherCookie,
        { method: "DELETE", body: {} },
      );
      assert.equal(deleteLastStage.status, 404);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      if (ownerId) {
        await Promise.all([
          Deal.deleteMany({ owner: ownerId }),
          Contact.deleteMany({ owner: ownerId }),
          PipelineStage.deleteMany({ owner: ownerId }),
          User.deleteOne({ _id: ownerId }),
        ]);
      }
      if (otherOwnerId) {
        await Promise.all([
          PipelineStage.deleteMany({ owner: otherOwnerId }),
          User.deleteOne({ _id: otherOwnerId }),
        ]);
      }
      await mongoose.disconnect();
    }
  },
);
