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
  "enforces Contact ownership, query behavior, and deletion rules over HTTP",
  { skip: process.env.RELIO_CONTACTS_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;
    let otherOwnerId: mongoose.Types.ObjectId | undefined;
    const server = createServer(app);

    try {
      const owner = await User.create({
        username: `contact-${token.slice(0, 12)}`,
        email: `contact-${token}@example.test`,
      });
      ownerId = owner._id;
      const otherOwner = await User.create({
        username: `other-${token.slice(0, 12)}`,
        email: `other-contact-${token}@example.test`,
      });
      otherOwnerId = otherOwner._id;
      const ownerCookie = cookieFor(owner);
      const otherCookie = cookieFor(otherOwner);
      const ownerCompany = await Company.create({
        owner: ownerId,
        name: `Owner ${token}`,
      });
      const otherCompany = await Company.create({
        owner: otherOwnerId,
        name: `Other ${token}`,
      });
      const stage = await PipelineStage.create({
        owner: ownerId,
        name: `Stage ${token}`,
        color: "#2563eb",
        order: 0,
      });

      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const address = server.address() as AddressInfo;
      const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

      assert.equal((await request(baseUrl, "/contacts")).status, 401);
      const foreignCompanyCreate = await request(baseUrl, "/contacts", ownerCookie, {
        method: "POST",
        body: {
          firstName: "Foreign",
          lastName: "Reference",
          company: String(otherCompany._id),
        },
      });
      assert.equal(foreignCompanyCreate.status, 404);

      const companyOptions = await request(
        baseUrl,
        `/contacts/company-options?search=${encodeURIComponent(`Owner ${token}`)}`,
        otherCookie,
      );
      assert.equal(companyOptions.status, 200);
      assert.deepEqual(((await companyOptions.json()) as { data: unknown[] }).data, []);

      const createResponse = await request(baseUrl, "/contacts", ownerCookie, {
        method: "POST",
        body: {
          firstName: "Avery",
          lastName: "Moss",
          email: `avery-${token}@example.test`,
          contactType: "lead",
          company: String(ownerCompany._id),
          tags: ["design", "freelance"],
        },
      });
      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as {
        data: { id: string; company: { id: string } };
      };
      const contactId = new mongoose.Types.ObjectId(created.data.id);
      assert.equal(created.data.company.id, String(ownerCompany._id));

      const updateResponse = await request(
        baseUrl,
        `/contacts/${contactId}`,
        ownerCookie,
        {
          method: "PATCH",
          body: { phone: "+1 555 0100", email: "" },
        },
      );
      assert.equal(updateResponse.status, 200);
      const updatedContact = (await updateResponse.json()) as {
        data: { phone: string; email: string };
      };
      assert.equal(updatedContact.data.phone, "+1 555 0100");
      assert.equal(updatedContact.data.email, "");

      const secondCreate = await request(baseUrl, "/contacts", ownerCookie, {
        method: "POST",
        body: { firstName: "No", lastName: "Email" },
      });
      assert.equal(secondCreate.status, 201);
      const secondId = ((await secondCreate.json()) as { data: { id: string } }).data
        .id;

      const listResponse = await request(
        baseUrl,
        "/contacts?search=avery&contactType=lead&tag=design&sortBy=name&sortDirection=asc&page=1&limit=5",
        ownerCookie,
      );
      assert.equal(listResponse.status, 200);
      const list = (await listResponse.json()) as {
        data: { id: string; dealsCount: number; lastActivityAt: string | null }[];
        meta: { total: number; page: number; limit: number };
      };
      assert.equal(list.meta.total, 1);
      assert.equal(list.meta.page, 1);
      assert.equal(list.data[0]?.id, String(contactId));
      assert.equal(list.data[0]?.dealsCount, 0);

      const stats = await request(baseUrl, "/contacts/stats", ownerCookie);
      assert.equal(((await stats.json()) as { data: { total: number } }).data.total, 2);
      assert.equal(
        (await request(baseUrl, `/contacts/${contactId}`, otherCookie)).status,
        404,
      );
      assert.equal(
        (
          await request(baseUrl, `/contacts/${contactId}`, otherCookie, {
            method: "PATCH",
            body: { firstName: "Changed" },
          })
        ).status,
        404,
      );

      const deal = await Deal.create({
        owner: ownerId,
        name: `Deal ${token}`,
        value: 250,
        primaryContact: contactId,
        pipelineStage: stage._id,
      });
      const task = await Task.create({
        owner: ownerId,
        title: `Task ${token}`,
        relatedEntityType: "Contact",
        relatedEntityId: contactId,
      });
      const activity = await Activity.create({
        owner: ownerId,
        type: "note",
        title: `Note ${token}`,
        contact: contactId,
        activityDate: new Date(),
      });
      const history = await DealHistory.create({
        owner: ownerId,
        deal: deal._id,
        eventType: "created",
      });

      const detailsResponse = await request(
        baseUrl,
        `/contacts/${contactId}`,
        ownerCookie,
      );
      const details = (await detailsResponse.json()) as {
        data: { dealsCount: number; lastActivityAt: string | null };
      };
      assert.equal(details.data.dealsCount, 1);
      assert.ok(details.data.lastActivityAt);

      assert.equal(
        (await request(baseUrl, `/contacts/${contactId}/deals`, ownerCookie)).status,
        200,
      );
      const dealsResponse = await request(
        baseUrl,
        `/contacts/${contactId}/deals`,
        ownerCookie,
      );
      assert.equal(
        ((await dealsResponse.json()) as { data: { id: string }[] }).data.length,
        1,
      );
      assert.equal(
        (await request(baseUrl, `/contacts/${contactId}/tasks`, ownerCookie)).status,
        200,
      );
      const tasksResponse = await request(
        baseUrl,
        `/contacts/${contactId}/tasks`,
        ownerCookie,
      );
      assert.equal(
        ((await tasksResponse.json()) as { data: { id: string }[] }).data.length,
        1,
      );
      assert.equal(
        (await request(baseUrl, `/contacts/${contactId}/activities`, ownerCookie))
          .status,
        200,
      );
      const activitiesResponse = await request(
        baseUrl,
        `/contacts/${contactId}/activities`,
        ownerCookie,
      );
      assert.equal(
        ((await activitiesResponse.json()) as { data: { id: string }[] }).data.length,
        1,
      );

      const partialBulkDelete = await request(
        baseUrl,
        "/contacts/bulk-delete",
        ownerCookie,
        {
          method: "POST",
          body: { ids: [String(contactId), String(otherCompany._id)] },
        },
      );
      assert.equal(partialBulkDelete.status, 404);
      assert.ok(await Contact.exists({ _id: contactId, owner: ownerId }));

      const deleteResponse = await request(
        baseUrl,
        `/contacts/${contactId}`,
        ownerCookie,
        { method: "DELETE" },
      );
      assert.equal(deleteResponse.status, 200);
      assert.equal(await Contact.exists({ _id: contactId }), null);
      assert.equal(await Task.exists({ _id: task._id }), null);
      assert.equal(await Activity.exists({ _id: activity._id }), null);
      assert.ok(await DealHistory.exists({ _id: history._id }));
      assert.equal((await Deal.findById(deal._id))?.primaryContact, null);
      assert.ok(await Contact.exists({ _id: secondId, owner: ownerId }));
    } finally {
      server.closeAllConnections();
      if (server.listening) {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
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
      if (otherOwnerId) {
        await Promise.all([
          Company.deleteMany({ owner: otherOwnerId }),
          User.deleteOne({ _id: otherOwnerId }),
        ]);
      }
      await mongoose.disconnect();
    }
  },
);
