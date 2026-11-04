import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import mongoose from "mongoose";
import { it } from "node:test";
import { env } from "../../config/env.js";
import { connectDatabase } from "../../database/connect.js";
import { Contact, Task, User } from "../../database/models/index.js";
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
  "enforces Task ownership, scheduling, completion, filters, and bulk actions over HTTP",
  { skip: process.env.RELIO_TASKS_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;
    let otherOwnerId: mongoose.Types.ObjectId | undefined;
    let contactId: mongoose.Types.ObjectId | undefined;
    let otherContactId: mongoose.Types.ObjectId | undefined;
    const server = createServer(app);

    try {
      const owner = await User.create({
        username: `task-${token.slice(0, 12)}`,
        email: `task-${token}@example.test`,
      });
      ownerId = owner._id;
      const otherOwner = await User.create({
        username: `other-task-${token.slice(0, 10)}`,
        email: `other-task-${token}@example.test`,
      });
      otherOwnerId = otherOwner._id;
      const ownerCookie = cookieFor(owner);
      const otherCookie = cookieFor(otherOwner);
      const contact = await Contact.create({
        owner: ownerId,
        firstName: "Jamie",
        lastName: "Rivera",
      });
      contactId = contact._id;
      const otherContact = await Contact.create({
        owner: otherOwnerId,
        firstName: "Morgan",
        lastName: "Lee",
      });
      otherContactId = otherContact._id;
      const otherTask = await Task.create({
        owner: otherOwnerId,
        title: `Other owner task ${token}`,
      });

      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

      assert.equal((await request(baseUrl, "/tasks")).status, 401);
      const foreignReference = await request(baseUrl, "/tasks", ownerCookie, {
        method: "POST",
        body: {
          title: "Foreign task reference",
          relatedEntityType: "Contact",
          relatedEntityId: String(otherContact._id),
        },
      });
      assert.equal(foreignReference.status, 404);

      const createResponse = await request(baseUrl, "/tasks", ownerCookie, {
        method: "POST",
        body: {
          title: `Follow-up ${token}`,
          description: "Send the revised proposal",
          type: "follow_up",
          priority: "high",
          dueDate: "2026-12-10",
          dueTime: "09:30",
          relatedEntityType: "Contact",
          relatedEntityId: String(contact._id),
        },
      });
      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as {
        data: {
          id: string;
          type: string;
          reminderAt: string;
          completedAt: string | null;
          relatedEntity: { type: string; label: string } | null;
        };
      };
      const createdId = new mongoose.Types.ObjectId(created.data.id);
      assert.equal(created.data.type, "follow_up");
      assert.equal(created.data.reminderAt, "2026-12-09T00:00:00.000Z");
      assert.equal(created.data.completedAt, null);
      assert.deepEqual(created.data.relatedEntity, {
        type: "Contact",
        id: String(contact._id),
        label: "Jamie Rivera",
      });

      const noDateResponse = await request(baseUrl, "/tasks", ownerCookie, {
        method: "POST",
        body: { title: `No date ${token}`, priority: "low" },
      });
      assert.equal(noDateResponse.status, 201);
      const noDateTask = (await noDateResponse.json()) as {
        data: { id: string; reminderAt: null };
      };
      assert.equal(noDateTask.data.reminderAt, null);
      const noDateId = new mongoose.Types.ObjectId(noDateTask.data.id);

      const filtered = await request(
        baseUrl,
        `/tasks?type=follow_up&priority=high&relatedEntityType=Contact&relatedEntityId=${contactId}`,
        ownerCookie,
      );
      assert.equal(filtered.status, 200);
      const filteredData = (await filtered.json()) as {
        data: { id: string }[];
        meta: { total: number; page: number };
      };
      assert.equal(filteredData.meta.total, 1);
      assert.equal(filteredData.data[0]?.id, String(createdId));

      const paged = await request(
        baseUrl,
        "/tasks?page=1&limit=1&sortBy=priority",
        ownerCookie,
      );
      const pagedData = (await paged.json()) as {
        data: { id: string }[];
        meta: { total: number; limit: number };
      };
      assert.equal(pagedData.meta.total, 2);
      assert.equal(pagedData.meta.limit, 1);
      assert.equal(pagedData.data.length, 1);

      assert.equal(
        (await request(baseUrl, `/tasks/${createdId}`, otherCookie)).status,
        404,
      );
      const invalidRelationUpdate = await request(
        baseUrl,
        `/tasks/${createdId}`,
        ownerCookie,
        { method: "PATCH", body: { relatedEntityType: "Company" } },
      );
      assert.equal(invalidRelationUpdate.status, 400);

      const completeResponse = await request(
        baseUrl,
        `/tasks/${createdId}`,
        ownerCookie,
        {
          method: "PATCH",
          body: { status: "completed", dueDate: "2026-12-20" },
        },
      );
      assert.equal(completeResponse.status, 200);
      const completed = (await completeResponse.json()) as {
        data: { completedAt: string; reminderAt: string; status: string };
      };
      assert.equal(completed.data.status, "completed");
      assert.ok(completed.data.completedAt);
      assert.equal(completed.data.reminderAt, "2026-12-19T00:00:00.000Z");

      const foreignBulk = await request(baseUrl, "/tasks/bulk-priority", ownerCookie, {
        method: "POST",
        body: { ids: [String(noDateId), String(otherTask._id)], priority: "high" },
      });
      assert.equal(foreignBulk.status, 404);
      assert.equal((await Task.findById(noDateId))?.priority, "low");
      assert.equal((await Task.findById(otherTask._id))?.priority, "medium");

      const bulkComplete = await request(baseUrl, "/tasks/bulk-complete", ownerCookie, {
        method: "POST",
        body: { ids: [String(noDateId)] },
      });
      assert.equal(bulkComplete.status, 200);
      const bulkCompleted = await Task.findById(noDateId).lean();
      assert.equal(bulkCompleted?.status, "completed");
      assert.ok(bulkCompleted?.completedAt);
      assert.equal(bulkCompleted?.reminderAt, null);

      const bulkPriority = await request(baseUrl, "/tasks/bulk-priority", ownerCookie, {
        method: "POST",
        body: { ids: [String(noDateId)], priority: "medium" },
      });
      assert.equal(bulkPriority.status, 200);
      assert.equal((await Task.findById(noDateId))?.priority, "medium");

      const deleteResponse = await request(baseUrl, "/tasks/bulk-delete", ownerCookie, {
        method: "POST",
        body: { ids: [String(createdId), String(noDateId)] },
      });
      assert.equal(deleteResponse.status, 200);
      assert.equal(
        await Task.countDocuments({ _id: { $in: [createdId, noDateId] } }),
        0,
      );
      assert.equal(
        (await request(baseUrl, "/tasks?owner=" + ownerId, ownerCookie)).status,
        400,
      );
    } finally {
      server.closeAllConnections();
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
      if (ownerId) await Task.deleteMany({ owner: ownerId });
      if (otherOwnerId) await Task.deleteMany({ owner: otherOwnerId });
      if (contactId) await Contact.deleteOne({ _id: contactId });
      if (otherContactId) await Contact.deleteOne({ _id: otherContactId });
      if (ownerId) await User.deleteOne({ _id: ownerId });
      if (otherOwnerId) await User.deleteOne({ _id: otherOwnerId });
      await mongoose.disconnect();
    }
  },
);
