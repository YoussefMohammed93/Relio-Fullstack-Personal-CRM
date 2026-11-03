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
  "enforces Company ownership, query behavior, duplicates, related records, and deletion rules over HTTP",
  { skip: process.env.RELIO_COMPANIES_INTEGRATION !== "1" },
  async () => {
    assert.equal(env.NODE_ENV, "development");
    await connectDatabase();

    const token = randomUUID();
    let ownerId: mongoose.Types.ObjectId | undefined;
    let otherOwnerId: mongoose.Types.ObjectId | undefined;
    const server = createServer(app);

    try {
      const owner = await User.create({
        username: `company-${token.slice(0, 12)}`,
        email: `company-${token}@example.test`,
      });
      ownerId = owner._id;
      const otherOwner = await User.create({
        username: `other-${token.slice(0, 12)}`,
        email: `other-company-${token}@example.test`,
      });
      otherOwnerId = otherOwner._id;
      const ownerCookie = cookieFor(owner);
      const otherCookie = cookieFor(otherOwner);
      const otherCompany = await Company.create({
        owner: otherOwnerId,
        name: `Private Company ${token}`,
      });
      const legacyCompany = await Company.create({
        owner: ownerId,
        name: `Legacy Company ${token}`,
        industry: "Consulting",
        companySize: "1-10 Employees",
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

      assert.equal((await request(baseUrl, "/companies")).status, 401);
      const createResponse = await request(baseUrl, "/companies", ownerCookie, {
        method: "POST",
        body: {
          name: `Relio ${token}`,
          industry: "technology",
          companySize: "11_50",
          annualRevenue: 250000,
          address: { city: "Portland", country: "US" },
        },
      });
      assert.equal(createResponse.status, 201);
      const created = (await createResponse.json()) as {
        data: {
          id: string;
          name: string;
          annualRevenue: number;
          contactsCount: number;
        };
      };
      const companyId = new mongoose.Types.ObjectId(created.data.id);
      assert.equal(created.data.name, `Relio ${token}`);
      assert.equal(created.data.annualRevenue, 250000);

      const duplicateResponse = await request(baseUrl, "/companies", ownerCookie, {
        method: "POST",
        body: { name: `relio ${token}`, industry: "technology" },
      });
      assert.equal(duplicateResponse.status, 201);
      const duplicate = (await duplicateResponse.json()) as { data: { id: string } };
      const duplicateId = new mongoose.Types.ObjectId(duplicate.data.id);

      const duplicateCheck = await request(
        baseUrl,
        `/companies/duplicate-check?name=${encodeURIComponent(`RELIO ${token}`)}`,
        ownerCookie,
      );
      assert.equal(duplicateCheck.status, 200);
      assert.equal(
        ((await duplicateCheck.json()) as { data: unknown[] }).data.length,
        2,
      );

      const contactResponse = await request(baseUrl, "/contacts", ownerCookie, {
        method: "POST",
        body: {
          firstName: "Casey",
          lastName: "Rowe",
          company: String(companyId),
          contactType: "client",
        },
      });
      assert.equal(contactResponse.status, 201);
      const contact = (await contactResponse.json()) as { data: { id: string } };
      const contactId = new mongoose.Types.ObjectId(contact.data.id);
      const deal = await Deal.create({
        owner: ownerId,
        name: `Opportunity ${token}`,
        value: 1250,
        primaryContact: contactId,
        company: companyId,
        pipelineStage: stage._id,
      });
      const directActivity = await Activity.create({
        owner: ownerId,
        type: "note",
        title: `Company note ${token}`,
        company: companyId,
        contact: contactId,
        deal: deal._id,
      });
      const contactActivity = await Activity.create({
        owner: ownerId,
        type: "call",
        title: `Contact call ${token}`,
        contact: contactId,
        activityDate: new Date(Date.now() - 1000),
      });
      const history = await DealHistory.create({
        owner: ownerId,
        deal: deal._id,
        eventType: "created",
      });
      const task = await Task.create({
        owner: ownerId,
        title: `Retained task ${token}`,
        relatedEntityType: "Company",
        relatedEntityId: companyId,
      });

      const listResponse = await request(
        baseUrl,
        `/companies?industry=technology&minContacts=1&sortBy=dealValue&sortDirection=desc&page=1&limit=5`,
        ownerCookie,
      );
      assert.equal(listResponse.status, 200);
      const list = (await listResponse.json()) as {
        data: {
          id: string;
          contactsCount: number;
          activeDeals: number;
          totalDealValue: number;
        }[];
        meta: { total: number; page: number; limit: number };
      };
      assert.equal(list.meta.total, 1);
      assert.equal(list.data[0]?.id, String(companyId));
      assert.equal(list.data[0]?.contactsCount, 1);
      assert.equal(list.data[0]?.activeDeals, 1);
      assert.equal(list.data[0]?.totalDealValue, 1250);

      const legacyListResponse = await request(
        baseUrl,
        "/companies?industry=consulting&companySize=1_10",
        ownerCookie,
      );
      assert.equal(legacyListResponse.status, 200);
      const legacyList = (await legacyListResponse.json()) as {
        data: { id: string; industry: string; companySize: string }[];
        meta: { total: number };
      };
      assert.equal(legacyList.meta.total, 1);
      assert.equal(legacyList.data[0]?.id, String(legacyCompany._id));
      assert.equal(legacyList.data[0]?.industry, "consulting");
      assert.equal(legacyList.data[0]?.companySize, "1_10");

      const statsResponse = await request(baseUrl, "/companies/stats", ownerCookie);
      const stats = (await statsResponse.json()) as {
        data: {
          totalCompanies: number;
          totalContacts: number;
          activeDeals: number;
          totalDealValue: number;
        };
      };
      assert.deepEqual(stats.data, {
        totalCompanies: 3,
        totalContacts: 1,
        activeDeals: 1,
        totalDealValue: 1250,
      });

      assert.equal(
        (await request(baseUrl, `/companies/${companyId}`, otherCookie)).status,
        404,
      );
      assert.equal(
        (
          await request(baseUrl, `/companies/${companyId}`, ownerCookie, {
            method: "PATCH",
            body: { name: "Renamed company" },
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request(baseUrl, `/companies/${companyId}`, otherCookie, {
            method: "PATCH",
            body: { name: "Unauthorized rename" },
          })
        ).status,
        404,
      );
      assert.equal(
        (await request(baseUrl, `/companies/${otherCompany._id}`, ownerCookie)).status,
        404,
      );

      const contactsResponse = await request(
        baseUrl,
        `/companies/${companyId}/contacts`,
        ownerCookie,
      );
      assert.equal(
        ((await contactsResponse.json()) as { data: unknown[] }).data.length,
        1,
      );
      const dealsResponse = await request(
        baseUrl,
        `/companies/${companyId}/deals`,
        ownerCookie,
      );
      assert.equal(
        ((await dealsResponse.json()) as { data: unknown[] }).data.length,
        1,
      );
      const activitiesResponse = await request(
        baseUrl,
        `/companies/${companyId}/activities`,
        ownerCookie,
      );
      const activities = (await activitiesResponse.json()) as {
        data: { id: string; source: { type: string } }[];
      };
      assert.equal(activities.data.length, 2);
      assert.equal(
        activities.data.filter(({ id }) => id === String(directActivity._id)).length,
        1,
      );
      assert.ok(
        activities.data.some(
          ({ id, source }) =>
            id === String(contactActivity._id) && source.type === "Contact",
        ),
      );

      const noteResponse = await request(
        baseUrl,
        `/companies/${companyId}/notes`,
        ownerCookie,
        {
          method: "POST",
          body: {
            title: `Follow-up context ${token}`,
            content: "Keep the renewal timing in mind.",
          },
        },
      );
      assert.equal(noteResponse.status, 201);
      const note = (await noteResponse.json()) as {
        data: { id: string; source: { type: string } };
      };
      assert.equal(note.data.source.type, "Company");
      assert.ok(
        await Activity.exists({
          _id: note.data.id,
          owner: ownerId,
          company: companyId,
          type: "note",
        }),
      );
      const notesResponse = await request(
        baseUrl,
        `/companies/${companyId}/notes`,
        ownerCookie,
      );
      assert.equal(
        ((await notesResponse.json()) as { data: unknown[] }).data.length,
        2,
      );

      const partialBulkDelete = await request(
        baseUrl,
        "/companies/bulk-delete",
        ownerCookie,
        {
          method: "POST",
          body: { ids: [String(companyId), String(otherCompany._id)] },
        },
      );
      assert.equal(partialBulkDelete.status, 404);
      assert.ok(await Company.exists({ _id: companyId, owner: ownerId }));
      assert.ok(await Contact.exists({ _id: contactId, company: companyId }));

      const deleteResponse = await request(
        baseUrl,
        `/companies/${companyId}`,
        ownerCookie,
        {
          method: "DELETE",
        },
      );
      assert.equal(deleteResponse.status, 200);
      assert.equal(await Company.exists({ _id: companyId }), null);
      assert.equal((await Contact.findById(contactId))?.company, null);
      assert.equal((await Deal.findById(deal._id))?.company, null);
      assert.ok(await Activity.exists({ _id: directActivity._id }));
      assert.ok(await Activity.exists({ _id: contactActivity._id }));
      assert.ok(await DealHistory.exists({ _id: history._id }));
      assert.ok(await Task.exists({ _id: task._id }));
      assert.ok(await Company.exists({ _id: duplicateId, owner: ownerId }));

      const bulkDeleteResponse = await request(
        baseUrl,
        "/companies/bulk-delete",
        ownerCookie,
        {
          method: "POST",
          body: { ids: [String(duplicateId)] },
        },
      );
      assert.equal(bulkDeleteResponse.status, 200);
      assert.equal(await Company.exists({ _id: duplicateId }), null);
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
