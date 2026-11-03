import mongoose from "mongoose";
import { Activity } from "../../database/models/activity.js";
import { Company } from "../../database/models/company.js";
import { Contact } from "../../database/models/contact.js";
import { Deal } from "../../database/models/deal.js";
import { relationshipIntegrity } from "../../database/relationship-integrity.js";
import { NotFoundError } from "../../errors/AppError.js";
import { buildPaginationMeta } from "../../shared/api.js";
import { buildFilterQuery } from "../../shared/query.js";
import type {
  CompaniesQuery,
  CompanyDuplicateQuery,
  CreateCompanyInput,
  CreateCompanyNoteInput,
  UpdateCompanyInput,
} from "./companies.schemas.js";

const objectId = (id: string) => new mongoose.Types.ObjectId(id);

const industryLabels: Record<string, string> = {
  technology: "Technology",
  finance: "Finance",
  healthcare: "Healthcare",
  education: "Education",
  marketing: "Marketing",
  e_commerce: "E-commerce",
  real_estate: "Real Estate",
  manufacturing: "Manufacturing",
  consulting: "Consulting",
  other: "Other",
};

const companySizeAliases: Record<string, string> = {
  self_employed: "self-employed",
  "1_10": "1-10 Employees",
  "11_50": "11-50 Employees",
  "51_200": "51-200 Employees",
  "201_500": "201-500 Employees",
  "501_1000": "501-1000 Employees",
  "1000_plus": "1000+ Employees",
};

function normalizedIndustry(value: unknown): string {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  const canonical = Object.entries(industryLabels).find(
    ([, label]) => label.toLowerCase() === normalized,
  )?.[0];
  return canonical ?? normalized;
}

function normalizedCompanySize(value: unknown): string {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-");
  const canonical = Object.entries(companySizeAliases).find(
    ([, label]) => label.toLowerCase().replace(/[–—]/g, "-") === normalized,
  )?.[0];
  return canonical ?? normalized;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeCompany(value: Record<string, unknown>) {
  const address = value.address as Record<string, string> | undefined;
  return {
    id: String(value._id),
    name: String(value.name ?? ""),
    website: String(value.website ?? ""),
    industry: normalizedIndustry(value.industry),
    email: String(value.email ?? ""),
    phone: String(value.phone ?? ""),
    address: {
      street: address?.street ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postalCode ?? "",
      country: address?.country ?? "",
    },
    description: String(value.description ?? ""),
    companySize: normalizedCompanySize(value.companySize),
    annualRevenue: value.annualRevenue == null ? null : Number(value.annualRevenue),
    linkedInUrl: String(value.linkedInUrl ?? ""),
    logoUrl: String(value.logoUrl ?? ""),
    contactsCount: Number(value.contactsCount ?? 0),
    activeDeals: Number(value.activeDeals ?? 0),
    totalDealValue: Number(value.totalDealValue ?? 0),
    createdAt: value.createdAt as Date,
    updatedAt: value.updatedAt as Date,
  };
}

function relationshipLookups(
  ownerId: mongoose.Types.ObjectId,
): mongoose.PipelineStage[] {
  return [
    {
      $lookup: {
        from: Contact.collection.name,
        let: { companyId: "$_id" },
        pipeline: [
          { $match: { owner: ownerId, $expr: { $eq: ["$company", "$$companyId"] } } },
          { $count: "count" },
        ],
        as: "contactSummary",
      },
    },
    {
      $lookup: {
        from: Deal.collection.name,
        let: { companyId: "$_id" },
        pipeline: [
          { $match: { owner: ownerId, $expr: { $eq: ["$company", "$$companyId"] } } },
          {
            $group: {
              _id: null,
              activeDeals: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
              totalDealValue: {
                $sum: { $cond: [{ $eq: ["$status", "open"] }, "$value", 0] },
              },
            },
          },
        ],
        as: "dealSummary",
      },
    },
    {
      $addFields: {
        contactsCount: { $ifNull: [{ $first: "$contactSummary.count" }, 0] },
        activeDeals: { $ifNull: [{ $first: "$dealSummary.activeDeals" }, 0] },
        totalDealValue: { $ifNull: [{ $first: "$dealSummary.totalDealValue" }, 0] },
      },
    },
  ];
}

export async function listCompanies(owner: string, filters: CompaniesQuery) {
  const ownerId = objectId(owner);
  const companyFilters = buildFilterQuery(
    {
      search: filters.search,
    },
    {
      allowedFields: [],
      searchFields: ["name", "email", "industry", "description"],
    },
  );
  const match: Record<string, unknown> = { owner: ownerId, ...companyFilters };
  if (filters.industry) {
    const label = industryLabels[filters.industry];
    match.industry = label ? { $in: [filters.industry, label] } : filters.industry;
  }
  if (filters.companySize) {
    const label = companySizeAliases[filters.companySize];
    const enDashLabel = label?.replace(/-/g, "–");
    match.companySize = label
      ? { $in: [filters.companySize, label, enDashLabel] }
      : filters.companySize;
  }

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

  const direction = filters.sortDirection === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> =
    filters.sortBy === "name"
      ? { name: direction as 1 | -1, _id: 1 as const }
      : filters.sortBy === "dealValue"
        ? { totalDealValue: direction as 1 | -1, name: 1 as const }
        : { createdAt: direction as 1 | -1 };
  const stages: mongoose.PipelineStage[] = [
    { $match: match },
    ...relationshipLookups(ownerId),
    ...(filters.minContacts !== undefined || filters.maxContacts !== undefined
      ? [
          {
            $match: {
              contactsCount: {
                ...(filters.minContacts !== undefined
                  ? { $gte: filters.minContacts }
                  : {}),
                ...(filters.maxContacts !== undefined
                  ? { $lte: filters.maxContacts }
                  : {}),
              },
            },
          },
        ]
      : []),
    {
      $facet: {
        items: [
          { $sort: sort },
          { $skip: (filters.page - 1) * filters.limit },
          { $limit: filters.limit },
          { $project: { owner: 0, contactSummary: 0, dealSummary: 0 } },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];
  const [result] = await Company.aggregate<{
    items: Record<string, unknown>[];
    total: { count: number }[];
  }>(stages);
  const total = result?.total[0]?.count ?? 0;
  return {
    companies: (result?.items ?? []).map(serializeCompany),
    meta: buildPaginationMeta({ page: filters.page, limit: filters.limit, total }),
  };
}

export async function getCompanyStats(owner: string) {
  const ownerId = objectId(owner);
  const [totalCompanies, totalContacts, dealSummary] = await Promise.all([
    Company.countDocuments({ owner: ownerId }),
    Contact.countDocuments({ owner: ownerId }),
    Deal.aggregate<{ activeDeals: number; totalDealValue: number }>([
      { $match: { owner: ownerId, status: "open" } },
      {
        $group: {
          _id: null,
          activeDeals: { $sum: 1 },
          totalDealValue: { $sum: "$value" },
        },
      },
    ]),
  ]);
  return {
    totalCompanies,
    totalContacts,
    activeDeals: dealSummary[0]?.activeDeals ?? 0,
    totalDealValue: dealSummary[0]?.totalDealValue ?? 0,
  };
}

export async function findCompanyDuplicates(
  owner: string,
  query: CompanyDuplicateQuery,
) {
  const filter: Record<string, unknown> = {
    owner: objectId(owner),
    name: new RegExp(`^${escapeRegex(query.name.trim())}$`, "i"),
  };
  if (query.excludeId) filter._id = { $ne: objectId(query.excludeId) };
  const matches = await Company.find(filter)
    .sort({ name: 1 })
    .limit(5)
    .select("name logoUrl")
    .lean();
  return matches.map((company) => ({
    id: String(company._id),
    name: company.name,
    logoUrl: company.logoUrl ?? "",
  }));
}

export async function createCompany(owner: string, input: CreateCompanyInput) {
  const company = await Company.create({ ...input, owner: objectId(owner) });
  return getCompany(owner, String(company._id));
}

export async function getCompany(owner: string, id: string) {
  const ownerId = objectId(owner);
  const [company] = await Company.aggregate<Record<string, unknown>>([
    { $match: { _id: objectId(id), owner: ownerId } },
    ...relationshipLookups(ownerId),
    { $project: { owner: 0, contactSummary: 0, dealSummary: 0 } },
  ]);
  if (!company) throw new NotFoundError("Company not found");
  return serializeCompany(company);
}

export async function updateCompany(
  owner: string,
  id: string,
  input: UpdateCompanyInput,
) {
  const company = await Company.findOneAndUpdate(
    { _id: objectId(id), owner: objectId(owner) },
    { $set: input },
    { new: true, runValidators: true },
  ).lean();
  if (!company) throw new NotFoundError("Company not found");
  return getCompany(owner, String(company._id));
}

export async function deleteCompanies(owner: string, ids: string[]) {
  await relationshipIntegrity.deleteCompanies(objectId(owner), ids.map(objectId));
  return { deletedCount: ids.length };
}

export async function getCompanyContacts(owner: string, id: string) {
  const ownerId = objectId(owner);
  await getCompany(owner, id);
  const contacts = await Contact.find({ owner: ownerId, company: objectId(id) })
    .sort({ lastName: 1, firstName: 1 })
    .select("firstName lastName email phone contactType jobTitle createdAt")
    .lean();
  return contacts.map((contact) => ({
    id: String(contact._id),
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    contactType: contact.contactType,
    jobTitle: contact.jobTitle,
    createdAt: contact.createdAt,
  }));
}

export async function getCompanyDeals(owner: string, id: string) {
  const ownerId = objectId(owner);
  await getCompany(owner, id);
  const deals = await Deal.find({ owner: ownerId, company: objectId(id) })
    .sort({ createdAt: -1 })
    .populate({
      path: "primaryContact",
      match: { owner: ownerId },
      select: "firstName lastName",
    })
    .lean();
  return deals.map((deal) => {
    const contact = deal.primaryContact as unknown as {
      _id: mongoose.Types.ObjectId;
      firstName: string;
      lastName: string;
    } | null;
    return {
      id: String(deal._id),
      name: deal.name,
      value: deal.value,
      status: deal.status,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      createdAt: deal.createdAt,
      primaryContact: contact
        ? { id: String(contact._id), name: `${contact.firstName} ${contact.lastName}` }
        : null,
    };
  });
}

export async function getCompanyActivities(owner: string, id: string) {
  const ownerId = objectId(owner);
  const company = await getCompany(owner, id);
  const companyId = objectId(id);
  const [contacts, deals] = await Promise.all([
    Contact.find({ owner: ownerId, company: companyId })
      .select("_id firstName lastName")
      .lean(),
    Deal.find({ owner: ownerId, company: companyId }).select("_id name").lean(),
  ]);
  const contactNames = new Map(
    contacts.map((contact) => [
      String(contact._id),
      `${contact.firstName} ${contact.lastName}`,
    ]),
  );
  const dealNames = new Map(deals.map((deal) => [String(deal._id), deal.name]));
  const activities = await Activity.find({
    owner: ownerId,
    $or: [
      { company: companyId },
      ...(contacts.length
        ? [{ contact: { $in: contacts.map(({ _id }) => _id) } }]
        : []),
      ...(deals.length ? [{ deal: { $in: deals.map(({ _id }) => _id) } }] : []),
    ],
  })
    .sort({ activityDate: -1, createdAt: -1 })
    .lean();

  return activities.map((activity) => {
    const directCompany = String(activity.company ?? "") === id;
    const dealName = dealNames.get(String(activity.deal ?? ""));
    const contactName = contactNames.get(String(activity.contact ?? ""));
    const source = directCompany
      ? { type: "Company", name: company.name }
      : dealName
        ? { type: "Deal", name: dealName }
        : { type: "Contact", name: contactName ?? "Related record" };
    return {
      id: String(activity._id),
      type: activity.type,
      title: activity.title,
      content: activity.content ?? "",
      activityDate: activity.activityDate,
      source,
    };
  });
}

export async function getCompanyNotes(owner: string, id: string) {
  const activities = await getCompanyActivities(owner, id);
  return activities.filter((activity) => activity.type === "note");
}

export async function createCompanyNote(
  owner: string,
  id: string,
  input: CreateCompanyNoteInput,
) {
  await getCompany(owner, id);
  const activity = await Activity.create({
    owner: objectId(owner),
    company: objectId(id),
    type: "note",
    title: input.title,
    content: input.content ?? "",
    activityDate: new Date(),
  });
  return {
    id: String(activity._id),
    type: activity.type,
    title: activity.title,
    content: activity.content ?? "",
    activityDate: activity.activityDate,
    source: { type: "Company", name: (await getCompany(owner, id)).name },
  };
}
