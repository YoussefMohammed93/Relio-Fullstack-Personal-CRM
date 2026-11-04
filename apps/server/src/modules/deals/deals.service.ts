import mongoose from "mongoose";
import { Activity } from "../../database/models/activity.js";
import { Contact } from "../../database/models/contact.js";
import { Deal, type DealLostReason, type IDeal } from "../../database/models/deal.js";
import { DealHistory } from "../../database/models/deal-history.js";
import {
  PipelineStage,
  type IPipelineStage,
} from "../../database/models/pipeline-stage.js";
import { Task } from "../../database/models/task.js";
import { relationshipIntegrity } from "../../database/relationship-integrity.js";
import { NotFoundError, ValidationError } from "../../errors/AppError.js";
import { buildPaginationMeta } from "../../shared/api.js";
import { buildFilterQuery } from "../../shared/query.js";
import type {
  BulkChangeDealStageInput,
  CreateDealInput,
  DealsQuery,
  LoseDealInput,
  UpdateDealInput,
} from "./deals.schemas.js";

const legacyDefaultProbability: Record<string, number> = {
  New: 10,
  Qualified: 25,
  Proposal: 50,
  Negotiation: 75,
};

type DealView = {
  id: string;
  name: string;
  value: number;
  currency: string;
  primaryContact: { id: string; name: string; email: string } | null;
  company: { id: string; name: string } | null;
  pipelineStage: {
    id: string;
    name: string;
    color: string;
    order: number;
    defaultProbability: number | null;
  } | null;
  probability: number | null;
  expectedCloseDate: Date | null;
  description: string;
  status: IDeal["status"];
  lostReason: DealLostReason | null;
  actualCloseDate: Date | null;
  lostDate: Date | null;
  finalValue: number | null;
  previousStage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function objectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

function stageProbability(stage: IPipelineStage): number | null {
  return (
    stage.defaultProbability ??
    (stage.isDefault ? (legacyDefaultProbability[stage.name] ?? null) : null)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function toDealView(value: Record<string, unknown>): DealView {
  const contact = isRecord(value.primaryContact) ? value.primaryContact : null;
  const company = isRecord(value.company) ? value.company : null;
  const stage = isRecord(value.pipelineStage) ? value.pipelineStage : null;
  const firstName = String(contact?.firstName ?? "").trim();
  const lastName = String(contact?.lastName ?? "").trim();
  const probability = value.probability == null ? null : Number(value.probability);
  const stageDefault = stage?.defaultProbability;
  const resolvedStageDefault =
    stageDefault == null && stage?.isDefault
      ? (legacyDefaultProbability[String(stage.name ?? "")] ?? null)
      : stageDefault;

  return {
    id: String(value._id),
    name: String(value.name ?? ""),
    value: Number(value.value ?? 0),
    currency: String(value.currency ?? "USD"),
    primaryContact: contact
      ? {
          id: String(contact._id),
          name: `${firstName} ${lastName}`.trim(),
          email: String(contact.email ?? ""),
        }
      : null,
    company: company
      ? { id: String(company._id), name: String(company.name ?? "") }
      : null,
    pipelineStage: stage
      ? {
          id: String(stage._id),
          name: String(stage.name ?? ""),
          color: String(stage.color ?? "#64748b"),
          order: Number(stage.order ?? 0),
          defaultProbability:
            resolvedStageDefault == null ? null : Number(resolvedStageDefault),
        }
      : null,
    probability,
    expectedCloseDate: (value.expectedCloseDate as Date | null | undefined) ?? null,
    description: String(value.description ?? ""),
    status: value.status as IDeal["status"],
    lostReason: (value.lostReason as DealLostReason | null | undefined) ?? null,
    actualCloseDate: (value.actualCloseDate as Date | null | undefined) ?? null,
    lostDate: (value.lostDate as Date | null | undefined) ?? null,
    finalValue: (value.finalValue as number | null | undefined) ?? null,
    previousStage: value.previousStage ? String(value.previousStage) : null,
    createdAt: value.createdAt as Date,
    updatedAt: value.updatedAt as Date,
  };
}

type DealQuery = ReturnType<typeof Deal.find> | ReturnType<typeof Deal.findOne>;

function populatedDealQuery<T extends DealQuery>(
  query: T,
  ownerId: mongoose.Types.ObjectId,
): T {
  query.populate({
    path: "primaryContact",
    match: { owner: ownerId },
    select: "firstName lastName email",
  });
  query.populate({ path: "company", match: { owner: ownerId }, select: "name" });
  query.populate({
    path: "pipelineStage",
    match: { owner: ownerId },
    select: "name color order defaultProbability isDefault",
  });
  return query;
}

function dateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  const until = to ? new Date(`${to}T00:00:00.000Z`) : undefined;
  until?.setUTCDate(until.getUTCDate() + 1);
  return {
    ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}),
    ...(until ? { $lt: until } : {}),
  };
}

function dealFilters(ownerId: mongoose.Types.ObjectId, filters: DealsQuery) {
  const match: Record<string, unknown> = {
    owner: ownerId,
    ...buildFilterQuery(
      {
        search: filters.search,
        status: filters.status,
        pipelineStage: filters.pipelineStage
          ? objectId(filters.pipelineStage)
          : undefined,
        primaryContact: filters.primaryContact
          ? objectId(filters.primaryContact)
          : undefined,
        company: filters.company ? objectId(filters.company) : undefined,
      },
      {
        allowedFields: ["status", "pipelineStage", "primaryContact", "company"],
        searchFields: ["name", "description"],
      },
    ),
  };
  if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
    match.value = {
      ...(filters.valueMin !== undefined ? { $gte: filters.valueMin } : {}),
      ...(filters.valueMax !== undefined ? { $lte: filters.valueMax } : {}),
    };
  }
  if (filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) {
    match.probability = {
      ...(filters.probabilityMin !== undefined ? { $gte: filters.probabilityMin } : {}),
      ...(filters.probabilityMax !== undefined ? { $lte: filters.probabilityMax } : {}),
    };
  }
  const expectedCloseDate = dateRange(filters.dateFrom, filters.dateTo);
  if (expectedCloseDate) match.expectedCloseDate = expectedCloseDate;
  return match;
}

export async function listDeals(owner: string, filters: DealsQuery) {
  const ownerId = objectId(owner);
  const match = dealFilters(ownerId, filters);
  const sortField = filters.sortBy;
  const sort: Record<string, 1 | -1> = {
    [sortField]: filters.sortDirection === "asc" ? 1 : -1,
    _id: 1,
  };
  const [deals, total] = await Promise.all([
    populatedDealQuery(Deal.find(match), ownerId)
      .sort(sort)
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    Deal.countDocuments(match),
  ]);
  return {
    deals: deals.map((deal) => toDealView(deal as unknown as Record<string, unknown>)),
    meta: buildPaginationMeta({ page: filters.page, limit: filters.limit, total }),
  };
}

export async function listDealBoard(owner: string, filters: DealsQuery) {
  const ownerId = objectId(owner);
  const boardFilters = dealFilters(ownerId, filters);
  const deals = await populatedDealQuery(Deal.find(boardFilters), ownerId)
    .sort({ createdAt: -1, _id: 1 })
    .lean();
  return deals.map((deal) => toDealView(deal as unknown as Record<string, unknown>));
}

export async function getDealStats(owner: string) {
  const ownerId = objectId(owner);
  const [summary] = await Deal.aggregate<{
    totalDeals: number;
    activeDeals: number;
    pipelineValue: number;
    wonRevenue: number;
    lostDeals: number;
  }>([
    { $match: { owner: ownerId } },
    {
      $group: {
        _id: null,
        totalDeals: { $sum: 1 },
        activeDeals: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
        pipelineValue: {
          $sum: { $cond: [{ $eq: ["$status", "open"] }, "$value", 0] },
        },
        wonRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$status", "won"] },
              { $ifNull: ["$finalValue", "$value"] },
              0,
            ],
          },
        },
        lostDeals: { $sum: { $cond: [{ $eq: ["$status", "lost"] }, 1, 0] } },
      },
    },
    { $project: { _id: 0 } },
  ]);
  return (
    summary ?? {
      totalDeals: 0,
      activeDeals: 0,
      pipelineValue: 0,
      wonRevenue: 0,
      lostDeals: 0,
    }
  );
}

async function loadOwnedStage(
  ownerId: mongoose.Types.ObjectId,
  stageId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
) {
  const query = PipelineStage.findOne({ _id: stageId, owner: ownerId });
  if (session) query.session(session);
  const stage = await query;
  if (!stage) throw new NotFoundError("Pipeline stage not found");
  return stage;
}

async function loadOwnedDeal(
  ownerId: mongoose.Types.ObjectId,
  dealId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession,
) {
  const query = Deal.findOne({ _id: dealId, owner: ownerId });
  if (session) query.session(session);
  const deal = await query;
  if (!deal) throw new NotFoundError("Deal not found");
  return deal;
}

async function appendHistory(
  values: {
    owner: mongoose.Types.ObjectId;
    deal: mongoose.Types.ObjectId;
    eventType:
      "created" | "stage_changed" | "value_changed" | "won" | "lost" | "reopened";
    previousValue?: number | null;
    newValue?: number | null;
    previousStage?: mongoose.Types.ObjectId | null;
    newStage?: mongoose.Types.ObjectId | null;
    eventDate: Date;
  },
  session: mongoose.ClientSession,
) {
  await DealHistory.create([values], { session });
}

async function transaction<T>(work: (session: mongoose.ClientSession) => Promise<T>) {
  const session = await mongoose.startSession();
  let result!: T;
  try {
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function getPopulatedDeal(
  ownerId: mongoose.Types.ObjectId,
  dealId: mongoose.Types.ObjectId,
) {
  const deal = await populatedDealQuery(
    Deal.findOne({ _id: dealId, owner: ownerId }),
    ownerId,
  ).lean();
  if (!deal) throw new NotFoundError("Deal not found");
  return toDealView(deal as unknown as Record<string, unknown>);
}

export async function createDeal(owner: string, input: CreateDealInput) {
  const ownerId = objectId(owner);
  const dealId = await transaction(async (session) => {
    await relationshipIntegrity.assertOwnedReferences(
      ownerId,
      [
        { type: "Contact", id: objectId(input.primaryContact) },
        { type: "PipelineStage", id: objectId(input.pipelineStage) },
        ...(input.company
          ? [{ type: "Company" as const, id: objectId(input.company) }]
          : []),
      ],
      session,
    );
    const stage = await loadOwnedStage(ownerId, objectId(input.pipelineStage), session);
    const contact = await Contact.findOne({
      _id: objectId(input.primaryContact),
      owner: ownerId,
    }).session(session);
    if (!contact) throw new NotFoundError("Contact not found");
    const companyId =
      input.company === undefined
        ? contact.company
        : input.company
          ? objectId(input.company)
          : null;
    if (companyId) {
      await relationshipIntegrity.assertOwnedReferences(
        ownerId,
        [{ type: "Company", id: companyId }],
        session,
      );
    }
    const probability = input.probability ?? stageProbability(stage);
    if (probability == null) {
      throw new ValidationError(
        "Set a probability before creating a Deal in this stage",
      );
    }
    const [deal] = await Deal.create(
      [
        {
          owner: ownerId,
          name: input.name,
          value: input.value,
          primaryContact: objectId(input.primaryContact),
          company: companyId,
          pipelineStage: stage._id,
          probability,
          expectedCloseDate: input.expectedCloseDate
            ? new Date(input.expectedCloseDate)
            : null,
          description: input.description ?? "",
        },
      ],
      { session },
    );
    await appendHistory(
      {
        owner: ownerId,
        deal: deal._id,
        eventType: "created",
        newValue: deal.value,
        newStage: deal.pipelineStage,
        eventDate: deal.createdAt,
      },
      session,
    );
    return deal._id;
  });
  return getPopulatedDeal(ownerId, dealId);
}

export async function getDeal(owner: string, id: string) {
  return getPopulatedDeal(objectId(owner), objectId(id));
}

export async function updateDeal(owner: string, id: string, input: UpdateDealInput) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  await transaction(async (session) => {
    const deal = await loadOwnedDeal(ownerId, dealId, session);
    const previousValue = deal.value;
    const previousStageId = deal.pipelineStage;
    const nextStageId = input.pipelineStage
      ? objectId(input.pipelineStage)
      : previousStageId;
    const stageChanged = !previousStageId.equals(nextStageId);
    if (stageChanged && deal.status !== "open") {
      throw new ValidationError("Reopen a closed Deal before changing its stage");
    }
    const contactId =
      input.primaryContact === undefined
        ? deal.primaryContact
        : input.primaryContact
          ? objectId(input.primaryContact)
          : null;
    const companyWasProvided = input.company !== undefined;
    const companyId = companyWasProvided
      ? input.company
        ? objectId(input.company)
        : null
      : input.primaryContact !== undefined && contactId
        ? null
        : deal.company;
    const references = [
      ...(contactId ? [{ type: "Contact" as const, id: contactId }] : []),
      ...(companyId ? [{ type: "Company" as const, id: companyId }] : []),
      ...(stageChanged ? [{ type: "PipelineStage" as const, id: nextStageId }] : []),
    ];
    await relationshipIntegrity.assertOwnedReferences(ownerId, references, session);

    if (input.primaryContact !== undefined && !companyWasProvided && contactId) {
      const contact = await Contact.findOne({ _id: contactId, owner: ownerId }).session(
        session,
      );
      if (!contact) throw new NotFoundError("Contact not found");
      deal.company = contact.company ?? null;
      if (deal.company) {
        await relationshipIntegrity.assertOwnedReferences(
          ownerId,
          [{ type: "Company", id: deal.company }],
          session,
        );
      }
    }

    if (
      deal.status === "won" &&
      input.value !== undefined &&
      input.value !== deal.value
    ) {
      throw new ValidationError("Reopen a Won Deal before changing its value");
    }

    const stage = stageChanged
      ? await loadOwnedStage(ownerId, nextStageId, session)
      : null;
    const nextProbability =
      input.probability ??
      (stageChanged && stage
        ? (stageProbability(stage) ?? deal.probability)
        : deal.probability);
    if (nextProbability == null) {
      throw new ValidationError("Set a probability before moving a Deal to this stage");
    }

    if (input.name !== undefined) deal.name = input.name;
    if (input.value !== undefined) deal.value = input.value;
    if (input.primaryContact !== undefined) deal.primaryContact = contactId;
    if (companyWasProvided) deal.company = companyId;
    if (stageChanged) deal.pipelineStage = nextStageId;
    if (input.probability !== undefined || stageChanged)
      deal.probability = nextProbability;
    if (input.expectedCloseDate !== undefined) {
      deal.expectedCloseDate = input.expectedCloseDate
        ? new Date(input.expectedCloseDate)
        : null;
    }
    if (input.description !== undefined) deal.description = input.description;
    await deal.save({ session });

    if (stageChanged) {
      await appendHistory(
        {
          owner: ownerId,
          deal: dealId,
          eventType: "stage_changed",
          previousStage: previousStageId,
          newStage: nextStageId,
          eventDate: new Date(),
        },
        session,
      );
    }
    if (input.value !== undefined && input.value !== previousValue) {
      await appendHistory(
        {
          owner: ownerId,
          deal: dealId,
          eventType: "value_changed",
          previousValue,
          newValue: input.value,
          eventDate: new Date(),
        },
        session,
      );
    }
  });
  return getPopulatedDeal(ownerId, dealId);
}

export async function closeDeal(
  owner: string,
  id: string,
  status: "won" | "lost",
  input: LoseDealInput = {},
) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  await transaction(async (session) => {
    const deal = await loadOwnedDeal(ownerId, dealId, session);
    if (deal.status !== "open") {
      throw new ValidationError("Reopen this Deal before changing its outcome");
    }
    const previousStage = deal.pipelineStage;
    const eventDate = new Date();
    deal.previousStage = previousStage;
    deal.status = status;
    deal.actualCloseDate = status === "won" ? eventDate : null;
    deal.lostDate = status === "lost" ? eventDate : null;
    deal.finalValue = status === "won" ? deal.value : null;
    deal.lostReason = status === "lost" ? (input.lostReason ?? null) : null;
    await deal.save({ session });
    await appendHistory(
      {
        owner: ownerId,
        deal: dealId,
        eventType: status,
        previousStage,
        newStage: null,
        ...(status === "won" ? { newValue: deal.finalValue } : {}),
        eventDate,
      },
      session,
    );
  });
  return getPopulatedDeal(ownerId, dealId);
}

export async function reopenDeal(owner: string, id: string) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  await transaction(async (session) => {
    const deal = await loadOwnedDeal(ownerId, dealId, session);
    if (deal.status === "open") throw new ValidationError("This Deal is already open");
    const previousStageId = deal.pipelineStage;
    const nextStageId = deal.previousStage ?? deal.pipelineStage;
    await relationshipIntegrity.assertOwnedReferences(
      ownerId,
      [{ type: "PipelineStage", id: nextStageId }],
      session,
    );
    deal.status = "open";
    deal.pipelineStage = nextStageId;
    deal.previousStage = null;
    deal.actualCloseDate = null;
    deal.lostDate = null;
    deal.finalValue = null;
    deal.lostReason = null;
    await deal.save({ session });
    await appendHistory(
      {
        owner: ownerId,
        deal: dealId,
        eventType: "reopened",
        previousStage: previousStageId,
        newStage: nextStageId,
        eventDate: new Date(),
      },
      session,
    );
  });
  return getPopulatedDeal(ownerId, dealId);
}

export async function changeDealsStage(owner: string, input: BulkChangeDealStageInput) {
  const ownerId = objectId(owner);
  const dealIds = input.ids.map(objectId);
  const targetStageId = objectId(input.pipelineStage);
  await transaction(async (session) => {
    await relationshipIntegrity.assertOwnedReferences(
      ownerId,
      [
        ...dealIds.map((id) => ({ type: "Deal" as const, id })),
        { type: "PipelineStage", id: targetStageId },
      ],
      session,
    );
    const targetStage = await loadOwnedStage(ownerId, targetStageId, session);
    const deals = await Deal.find({ _id: { $in: dealIds }, owner: ownerId }).session(
      session,
    );
    for (const deal of deals) {
      if (deal.status !== "open") {
        throw new ValidationError("Only open Deals can be moved to a pipeline stage");
      }
      if (deal.pipelineStage.equals(targetStageId)) continue;
      const probability = stageProbability(targetStage) ?? deal.probability;
      if (probability == null) {
        throw new ValidationError(
          "Every selected Deal needs a probability before moving to this stage",
        );
      }
      const previousStage = deal.pipelineStage;
      deal.pipelineStage = targetStageId;
      deal.probability = probability;
      await deal.save({ session });
      await appendHistory(
        {
          owner: ownerId,
          deal: deal._id,
          eventType: "stage_changed",
          previousStage,
          newStage: targetStageId,
          eventDate: new Date(),
        },
        session,
      );
    }
  });
  return { changedCount: dealIds.length };
}

export async function deleteDeals(owner: string, ids: string[]) {
  await relationshipIntegrity.deleteDeals(objectId(owner), ids.map(objectId));
  return { deletedCount: ids.length };
}

export async function getDealActivities(owner: string, id: string) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  const deal = await loadOwnedDeal(ownerId, dealId);
  const sources: {
    deal?: mongoose.Types.ObjectId;
    contact?: mongoose.Types.ObjectId;
  }[] = [{ deal: dealId }];
  if (deal.primaryContact) sources.push({ contact: deal.primaryContact });
  const activities = await Activity.find({ owner: ownerId, $or: sources })
    .sort({ activityDate: -1, createdAt: -1 })
    .lean();
  return activities.map((activity) => ({
    id: String(activity._id),
    type: activity.type,
    title: activity.title,
    content: activity.content ?? "",
    activityDate: activity.activityDate,
    scheduledAt: activity.scheduledAt ?? null,
    source:
      activity.deal && activity.contact
        ? "Deal and Primary Contact"
        : activity.deal
          ? "Deal"
          : "Primary Contact",
  }));
}

export async function getDealTasks(owner: string, id: string) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  await loadOwnedDeal(ownerId, dealId);
  const tasks = await Task.find({
    owner: ownerId,
    relatedEntityType: "Deal",
    relatedEntityId: dealId,
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

export async function getDealHistory(owner: string, id: string) {
  const ownerId = objectId(owner);
  const dealId = objectId(id);
  await loadOwnedDeal(ownerId, dealId);
  const history = await DealHistory.find({ owner: ownerId, deal: dealId })
    .sort({ eventDate: -1, _id: -1 })
    .populate({ path: "previousStage", match: { owner: ownerId }, select: "name" })
    .populate({ path: "newStage", match: { owner: ownerId }, select: "name" })
    .lean();
  return history.map((event) => {
    const previousStage = event.previousStage as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
    } | null;
    const newStage = event.newStage as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
    } | null;
    return {
      id: String(event._id),
      eventType: event.eventType,
      previousValue: event.previousValue ?? null,
      newValue: event.newValue ?? null,
      previousStage: previousStage?.name ?? null,
      newStage: newStage?.name ?? null,
      eventDate: event.eventDate,
    };
  });
}
