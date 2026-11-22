/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import {
  MeetingType,
  TrainingStatus,
} from "./trainingSchedule.interface";
import { TrainingSchedule } from "./trainingSchedule.model";

const USER_FIELDS = "name email employee_id phone picture";

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Ei field gulo client theke set/update kora jay
const EDITABLE_FIELDS = [
  "customerName",
  "companyName",
  "customerPhone",
  "customerEmail",
  "date",
  "startTime",
  "endTime",
  "trainer",
  "lead",
  "topic",
  "meetingType",
  "meetingLink",
  "location",
  "notes",
  "status",
] as const;

const populateUsers = (query: any) =>
  query.populate("trainer", USER_FIELDS).populate("lead", USER_FIELDS);

const normalizeDate = (value: any) => {
  const date = String(value ?? "").slice(0, 10);
  if (!DATE_REGEX.test(date)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid date, use YYYY-MM-DD");
  }
  return date;
};

// "9:30" -> "09:30", "14:00" thik ache
const normalizeTime = (value: any, field: string) => {
  const str = String(value ?? "").trim();
  const padded = /^\d:\d{2}$/.test(str) ? `0${str}` : str;
  if (!TIME_REGEX.test(padded)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid ${field}, use HH:mm (24 hour) format`
    );
  }
  return padded;
};

const ensureUserExists = async (id: any, field: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${field}`);
  }
  const user = await User.findById(id).select("_id").lean();
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, `${field} not found`);
  }
};

// Ek trainer er same dine overlapping meeting thakle conflict
const ensureNoTrainerConflict = async (data: any, excludeId?: string) => {
  if (data.status === TrainingStatus.CANCELLED) return;

  const filter: any = {
    trainer: data.trainer,
    date: data.date,
    status: { $ne: TrainingStatus.CANCELLED },
  };
  if (excludeId) filter._id = { $ne: excludeId };

  const sameDay = await TrainingSchedule.find(filter)
    .select("customerName startTime endTime")
    .lean();

  // endTime na thakle 1 ghontar meeting dhore nei
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const start = toMinutes(data.startTime);
  const end = data.endTime ? toMinutes(data.endTime) : start + 60;

  const clash = sameDay.find((s) => {
    const sStart = toMinutes(s.startTime);
    const sEnd = s.endTime ? toMinutes(s.endTime) : sStart + 60;
    return start < sEnd && sStart < end;
  });

  if (clash) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Trainer already has a meeting with ${clash.customerName} at ${clash.startTime}${
        clash.endTime ? `-${clash.endTime}` : ""
      } on ${data.date}`
    );
  }
};

// Payload theke shudhu allowed field nei, validate + normalize kori
const cleanPayload = async (payload: any, isCreate: boolean) => {
  const data: any = {};
  for (const key of EDITABLE_FIELDS) {
    if (payload[key] !== undefined) data[key] = payload[key];
  }

  if (isCreate || data.customerName !== undefined) {
    if (!data.customerName || !String(data.customerName).trim()) {
      throw new AppError(httpStatus.BAD_REQUEST, "Customer name is required");
    }
  }

  if (isCreate || data.date !== undefined) data.date = normalizeDate(data.date);
  if (isCreate || data.startTime !== undefined) {
    data.startTime = normalizeTime(data.startTime, "startTime");
  }
  if (data.endTime !== undefined) {
    data.endTime = data.endTime ? normalizeTime(data.endTime, "endTime") : undefined;
  }

  if (isCreate || data.trainer !== undefined) {
    if (!data.trainer) {
      throw new AppError(httpStatus.BAD_REQUEST, "Trainer is required");
    }
    await ensureUserExists(data.trainer, "Trainer");
  }

  if (data.lead !== undefined) {
    if (data.lead) await ensureUserExists(data.lead, "Lead");
    else data.lead = undefined;
  }

  if (
    data.meetingType !== undefined &&
    !Object.values(MeetingType).includes(data.meetingType)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `meetingType must be one of: ${Object.values(MeetingType).join(", ")}`
    );
  }

  if (
    data.status !== undefined &&
    !Object.values(TrainingStatus).includes(data.status)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `status must be one of: ${Object.values(TrainingStatus).join(", ")}`
    );
  }

  return data;
};

const validateTimeOrder = (startTime: string, endTime?: string) => {
  if (endTime && endTime <= startTime) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End time must be after start time"
    );
  }
};

// ?date= / ?month= / ?fromDate=&toDate=
const buildDateFilter = (query: any) => {
  if (query.date) return normalizeDate(query.date);

  if (query.month) {
    if (!MONTH_REGEX.test(query.month)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid month, use YYYY-MM");
    }
    return { $gte: `${query.month}-01`, $lte: `${query.month}-31` };
  }

  if (query.fromDate || query.toDate) {
    const range: any = {};
    if (query.fromDate) range.$gte = normalizeDate(query.fromDate);
    if (query.toDate) range.$lte = normalizeDate(query.toDate);
    return range;
  }

  return undefined;
};

const buildFilter = (query: any) => {
  const filter: any = {};

  const dateFilter = buildDateFilter(query);
  if (dateFilter) filter.date = dateFilter;

  if (query.trainer) filter.trainer = query.trainer;
  if (query.lead) filter.lead = query.lead;
  if (query.status) filter.status = query.status;
  if (query.meetingType) filter.meetingType = query.meetingType;

  if (query.search) {
    const escaped = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { customerName: regex },
      { companyName: regex },
      { customerPhone: regex },
      { topic: regex },
    ];
  }

  return filter;
};

const findOrThrow = async (id: string) => {
  const schedule = await TrainingSchedule.findById(id);
  if (!schedule) {
    throw new AppError(httpStatus.NOT_FOUND, "Training schedule not found");
  }
  return schedule;
};

const createSchedule = async (payload: any, userId?: string) => {
  const data = await cleanPayload(payload, true);
  validateTimeOrder(data.startTime, data.endTime);
  await ensureNoTrainerConflict(data);

  const created = await TrainingSchedule.create({ ...data, createdBy: userId });
  return await populateUsers(TrainingSchedule.findById(created._id));
};

const getAllSchedules = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;

  const filter = buildFilter(query);

  const [data, total] = await Promise.all([
    populateUsers(
      TrainingSchedule.find(filter)
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
    ),
    TrainingSchedule.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// Calendar view: date onujayi group kora
//  { "2026-11-25": [ {..meeting..}, ... ], ... }
const getCalendar = async (query: any) => {
  if (!query.month && !query.fromDate && !query.toDate && !query.date) {
    const now = new Date();
    query.month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const filter = buildFilter(query);

  const schedules = await populateUsers(
    TrainingSchedule.find(filter).sort({ date: 1, startTime: 1 })
  );

  const calendar: Record<string, any[]> = {};
  for (const s of schedules as any[]) {
    (calendar[s.date] ||= []).push(s);
  }

  return {
    month: query.month,
    total: schedules.length,
    calendar,
  };
};

// Logged-in user je meeting gulote trainer ba lead
const getMySchedules = async (userId: string, query: any) => {
  const filter = buildFilter(query);
  const userFilter = { $or: [{ trainer: userId }, { lead: userId }] };

  const finalFilter = filter.$or
    ? { $and: [filter, userFilter] }
    : { ...filter, ...userFilter };

  return await populateUsers(
    TrainingSchedule.find(finalFilter).sort({ date: 1, startTime: 1 })
  );
};

const getSingleSchedule = async (id: string) => {
  await findOrThrow(id);
  return await populateUsers(TrainingSchedule.findById(id));
};

const updateSchedule = async (id: string, payload: any) => {
  const existing = await findOrThrow(id);
  const data = await cleanPayload(payload, false);

  // Merge kore final value diye time + conflict check
  const merged: any = {
    trainer: data.trainer ?? existing.trainer,
    date: data.date ?? existing.date,
    startTime: data.startTime ?? existing.startTime,
    endTime: "endTime" in data ? data.endTime : existing.endTime,
    status: data.status ?? existing.status,
  };

  validateTimeOrder(merged.startTime, merged.endTime);
  await ensureNoTrainerConflict(merged, id);

  // undefined field gula $unset kori (jemon lead/endTime muche fela)
  const $set: any = {};
  const $unset: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) $unset[key] = "";
    else $set[key] = value;
  }

  // Tarikh/shomoy bodlale status Rescheduled (jodi alada status na dey)
  const timeChanged =
    (data.date && data.date !== existing.date) ||
    (data.startTime && data.startTime !== existing.startTime);
  if (
    timeChanged &&
    data.status === undefined &&
    existing.status === TrainingStatus.SCHEDULED
  ) {
    $set.status = TrainingStatus.RESCHEDULED;
  }

  return await populateUsers(
    TrainingSchedule.findByIdAndUpdate(
      id,
      {
        ...(Object.keys($set).length && { $set }),
        ...(Object.keys($unset).length && { $unset }),
      },
      { new: true, runValidators: true }
    )
  );
};

const updateStatus = async (id: string, status: any) => {
  if (!Object.values(TrainingStatus).includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `status must be one of: ${Object.values(TrainingStatus).join(", ")}`
    );
  }

  const existing = await findOrThrow(id);

  // Cancelled theke abar active korle conflict check
  if (
    existing.status === TrainingStatus.CANCELLED &&
    status !== TrainingStatus.CANCELLED
  ) {
    await ensureNoTrainerConflict(
      {
        trainer: existing.trainer,
        date: existing.date,
        startTime: existing.startTime,
        endTime: existing.endTime,
        status,
      },
      id
    );
  }

  return await populateUsers(
    TrainingSchedule.findByIdAndUpdate(id, { status }, { new: true })
  );
};

// Je create koreche se ba admin delete korte parbe
const deleteSchedule = async (id: string, userId: string, isAdmin: boolean) => {
  const schedule = await findOrThrow(id);

  if (!isAdmin && String(schedule.createdBy) !== String(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the creator or an admin can delete this schedule"
    );
  }

  await schedule.deleteOne();
  return schedule;
};

export const TrainingScheduleService = {
  createSchedule,
  getAllSchedules,
  getCalendar,
  getMySchedules,
  getSingleSchedule,
  updateSchedule,
  updateStatus,
  deleteSchedule,
};
