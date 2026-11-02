import mongoose from "mongoose";
import { Activity } from "../../database/models/activity.js";
import { Company } from "../../database/models/company.js";
import { Contact } from "../../database/models/contact.js";
import { Deal } from "../../database/models/deal.js";
import { Task } from "../../database/models/task.js";
import { relationshipIntegrity } from "../../database/relationship-integrity.js";
import { NotFoundError } from "../../errors/AppError.js";
import { buildFilterQuery } from "../../shared/query.js";
import { buildPaginationMeta } from "../../shared/api.js";
import type {
  CompanyOptionsQuery,
  CreateContactInput,
  ContactsQuery,
  UpdateContactInput,
} from "./contacts.schemas.js";

type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: { id: string; name: string } | null;
  contactType: "lead" | "client" | "former_client" | "partner";
  jobTitle: string;
  tags: string[];
  website: string;
  notes: string;
  dealsCount: number;
  lastActivityAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toContactListItem(value: Record<string, unknown>): ContactListItem {
  const company = value.companyInfo as
    { _id: mongoose.Types.ObjectId; name: string } | null | undefined;
  const id = value._id as mongoose.Types.ObjectId;

  return {
    id: String(id),
    firstName: String(value.firstName ?? ""),
    lastName: String(value.lastName ?? ""),
    email: String(value.email ?? ""),
    phone: String(value.phone ?? ""),
    company: company ? { id: String(company._id), name: company.name } : null,
    contactType: value.contactType as ContactListItem["contactType"],
    jobTitle: String(value.jobTitle ?? ""),
    tags: (value.tags as string[] | undefined) ?? [],
    website: String(value.website ?? ""),
    notes: String(value.notes ?? ""),
    dealsCount: Number(value.dealsCount ?? 0),
    lastActivityAt: (value.lastActivityAt as Date | undefined) ?? null,
    createdAt: value.createdAt as Date,
    updatedAt: value.updatedAt as Date,
  };
}

function objectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function normalizedContactInput<T extends CreateContactInput | UpdateContactInput>(
  input: T,
): T {
  const normalized = { ...input } as T;
  if (normalized.tags) normalized.tags = [...new Set(normalized.tags)];
  return normalized;
}

export async function listContacts(owner: string, filters: ContactsQuery) {
  const ownerId = objectId(owner);
  const contactFilters = buildFilterQuery(
    {
      search: filters.search,
      contactType: filters.contactType,
      company: filters.company ? objectId(filters.company) : undefined,
      tags: filters.tag,
    },
    {
      allowedFields: ["contactType", "company"],
      searchFields: ["firstName", "lastName", "email", "jobTitle"],
    },
  );
  if (filters.tag) contactFilters.tags = filters.tag;
  const match: Record<string, unknown> = { owner: ownerId, ...contactFilters };

  if (filters.dateFrom || filters.dateTo) {
    const dateToExclusive = filters.dateTo
      ? new Date(`${filters.dateTo}T00:00:00.000Z`)
      : undefined;
    dateToExclusive?.setUTCDate(dateToExclusive.getUTCDate() + 1);
    match.createdAt = {
      ...(filters.dateFrom
        ? { $gte: new Date(`${filters.dateFrom}T00:00:00.000Z`) }
        : {}),
      ...(dateToExclusive ? { $lt: dateToExclusive } : {}),
    };
  }

  const sort: Record<string, 1 | -1> =
    filters.sortBy === "name"
      ? {
          lastName: filters.sortDirection === "asc" ? (1 as const) : (-1 as const),
          firstName: 1,
        }
      : filters.sortBy === "lastActivity"
        ? {
            lastActivityAt:
              filters.sortDirection === "asc" ? (1 as const) : (-1 as const),
            lastName: 1,
          }
        : {
            createdAt: filters.sortDirection === "asc" ? (1 as const) : (-1 as const),
          };

  const [result] = await Contact.aggregate<{
    items: Record<string, unknown>[];
    total: { count: number }[];
  }>([
    { $match: match },
    {
      $lookup: {
        from: Activity.collection.name,
        let: { contactId: "$_id" },
        pipeline: [
          {
            $match: {
              owner: ownerId,
              $expr: { $eq: ["$contact", "$$contactId"] },
            },
          },
          { $sort: { activityDate: -1 } },
          { $limit: 1 },
          { $project: { _id: 0, activityDate: 1 } },
        ],
        as: "recentActivity",
      },
    },
    {
      $addFields: {
        lastActivityAt: { $arrayElemAt: ["$recentActivity.activityDate", 0] },
      },
    },
    {
      $facet: {
        items: [
          { $sort: sort },
          { $skip: (filters.page - 1) * filters.limit },
          { $limit: filters.limit },
          {
            $lookup: {
              from: Company.collection.name,
              let: { companyId: "$company" },
              pipeline: [
                {
                  $match: {
                    owner: ownerId,
                    $expr: { $eq: ["$_id", "$$companyId"] },
                  },
                },
                { $project: { name: 1 } },
              ],
              as: "companyInfo",
            },
          },
          { $unwind: { path: "$companyInfo", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: Deal.collection.name,
              let: { contactId: "$_id" },
              pipeline: [
                {
                  $match: {
                    owner: ownerId,
                    $expr: { $eq: ["$primaryContact", "$$contactId"] },
                  },
                },
                { $count: "count" },
              ],
              as: "dealCount",
            },
          },
          {
            $addFields: {
              dealsCount: { $ifNull: [{ $first: "$dealCount.count" }, 0] },
            },
          },
          { $project: { owner: 0, recentActivity: 0, dealCount: 0 } },
        ],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const total = result?.total[0]?.count ?? 0;
  return {
    contacts: (result?.items ?? []).map(toContactListItem),
    meta: buildPaginationMeta({ page: filters.page, limit: filters.limit, total }),
  };
}

export async function getContactStats(owner: string) {
  const ownerId = objectId(owner);
  const groups = await Contact.aggregate<{ _id: string; count: number }>([
    { $match: { owner: ownerId } },
    { $group: { _id: "$contactType", count: { $sum: 1 } } },
  ]);
  const byType = Object.fromEntries(groups.map(({ _id, count }) => [_id, count]));
  return {
    total: groups.reduce((sum, group) => sum + group.count, 0),
    byType: {
      lead: byType.lead ?? 0,
      client: byType.client ?? 0,
      former_client: byType.former_client ?? 0,
      partner: byType.partner ?? 0,
    },
  };
}

export async function listCompanyOptions(owner: string, filters: CompanyOptionsQuery) {
  const query = buildFilterQuery(
    { search: filters.search },
    { allowedFields: [], searchFields: ["name"] },
  );
  const companies = await Company.find({ owner: objectId(owner), ...query })
    .sort({ name: 1 })
    .limit(20)
    .select("name")
    .lean();
  return companies.map((company) => ({ id: String(company._id), name: company.name }));
}

export async function createContact(owner: string, input: CreateContactInput) {
  const ownerId = objectId(owner);
  const values = normalizedContactInput(input);
  if (values.company) {
    await relationshipIntegrity.assertOwnedReferences(ownerId, [
      { type: "Company", id: objectId(values.company) },
    ]);
  }

  const contact = await Contact.create({ ...values, owner: ownerId });
  return getContact(owner, String(contact._id));
}

function listContactDocument(value: Record<string, unknown>): ContactListItem {
  return toContactListItem({
    ...value,
    companyInfo:
      value.company && typeof value.company === "object" ? value.company : null,
  });
}

export async function getContact(owner: string, id: string) {
  const ownerId = objectId(owner);
  const contact = await Contact.findOne({ _id: objectId(id), owner: ownerId })
    .populate({ path: "company", match: { owner: objectId(owner) }, select: "name" })
    .lean();
  if (!contact) throw new NotFoundError("Contact not found");
  const [dealsCount, lastActivity] = await Promise.all([
    Deal.countDocuments({ owner: ownerId, primaryContact: objectId(id) }),
    Activity.findOne({ owner: ownerId, contact: objectId(id) })
      .sort({ activityDate: -1 })
      .select("activityDate")
      .lean(),
  ]);
  return {
    ...listContactDocument(contact as unknown as Record<string, unknown>),
    dealsCount,
    lastActivityAt: lastActivity?.activityDate ?? null,
  };
}

export async function updateContact(
  owner: string,
  id: string,
  input: UpdateContactInput,
) {
  const ownerId = objectId(owner);
  const values = normalizedContactInput(input);
  if (values.company) {
    await relationshipIntegrity.assertOwnedReferences(ownerId, [
      { type: "Company", id: objectId(values.company) },
    ]);
  }

  const contact = await Contact.findOneAndUpdate(
    { _id: objectId(id), owner: ownerId },
    { $set: values },
    { new: true, runValidators: true },
  )
    .populate({ path: "company", match: { owner: ownerId }, select: "name" })
    .lean();
  if (!contact) throw new NotFoundError("Contact not found");
  return listContactDocument(contact as unknown as Record<string, unknown>);
}

export async function deleteContacts(owner: string, ids: string[]) {
  await relationshipIntegrity.deleteContacts(objectId(owner), ids.map(objectId));
  return { deletedCount: ids.length };
}

export async function getContactDeals(owner: string, id: string) {
  const ownerId = objectId(owner);
  await getContact(owner, id);
  const deals = await Deal.find({ owner: ownerId, primaryContact: objectId(id) })
    .sort({ createdAt: -1 })
    .select("name value status pipelineStage company expectedCloseDate createdAt")
    .populate({ path: "company", match: { owner: ownerId }, select: "name" })
    .lean();
  return deals.map((deal) => {
    const company = deal.company as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
    } | null;
    return {
      id: String(deal._id),
      name: deal.name,
      value: deal.value,
      status: deal.status,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      createdAt: deal.createdAt,
      company: company ? { id: String(company._id), name: company.name } : null,
    };
  });
}

export async function getContactTasks(owner: string, id: string) {
  const ownerId = objectId(owner);
  await getContact(owner, id);
  const tasks = await Task.find({
    owner: ownerId,
    relatedEntityType: "Contact",
    relatedEntityId: objectId(id),
  })
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();
  return tasks.map((task) => ({
    id: String(task._id),
    title: task.title,
    type: task.type,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    dueTime: task.dueTime ?? "",
    createdAt: task.createdAt,
  }));
}

export async function getContactActivities(owner: string, id: string) {
  const ownerId = objectId(owner);
  await getContact(owner, id);
  const activities = await Activity.find({ owner: ownerId, contact: objectId(id) })
    .sort({ activityDate: -1, createdAt: -1 })
    .lean();
  return activities.map((activity) => ({
    id: String(activity._id),
    type: activity.type,
    title: activity.title,
    content: activity.content ?? "",
    activityDate: activity.activityDate,
    scheduledAt: activity.scheduledAt ?? null,
  }));
}
