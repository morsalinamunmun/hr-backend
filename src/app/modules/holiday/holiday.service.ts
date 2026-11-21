/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Holiday } from "./holiday.model";

// "2026-12-16" ba ISO date -> oi diner 00:00 UTC (timezone er jonno din jate na bodlay)
const normalizeDate = (value: any) => {
  if (!value) {
    throw new AppError(httpStatus.BAD_REQUEST, "Date is required");
  }

  const str = String(value);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date(str);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid date");
  }

  if (!match) date.setUTCHours(0, 0, 0, 0);

  return date;
};

const dayRange = (date: Date) => {
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { $gte: date, $lte: end };
};

const ensureNoDuplicate = async (date: Date, excludeId?: string) => {
  const filter: any = { date: dayRange(date) };
  if (excludeId) filter._id = { $ne: excludeId };

  const exists = await Holiday.findOne(filter).lean();
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      `A holiday (${exists.name}) already exists on this date`
    );
  }
};

const findOrThrow = async (id: string) => {
  const holiday = await Holiday.findById(id);
  if (!holiday) {
    throw new AppError(httpStatus.NOT_FOUND, "Holiday not found");
  }
  return holiday;
};

const createHoliday = async (payload: any, userId?: string) => {
  if (!payload.name || !String(payload.name).trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Holiday name is required");
  }

  const date = normalizeDate(payload.date);
  await ensureNoDuplicate(date);

  return await Holiday.create({
    name: payload.name,
    date,
    type: payload.type || "Public",
    description: payload.description,
    createdBy: userId,
  });
};

const getAllHolidays = async (query: {
  page?: string;
  limit?: string;
  year?: string;
  month?: string;
  fromDate?: string;
  toDate?: string;
  type?: string;
  search?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 100;
  const skip = (page - 1) * limit;

  const filter: any = {};

  // ?year=2026 ba ?year=2026&month=12
  if (query.year) {
    const year = Number(query.year);
    const month = query.month ? Number(query.month) - 1 : undefined;

    const start =
      month !== undefined
        ? new Date(Date.UTC(year, month, 1))
        : new Date(Date.UTC(year, 0, 1));
    const end =
      month !== undefined
        ? new Date(Date.UTC(year, month + 1, 1))
        : new Date(Date.UTC(year + 1, 0, 1));

    filter.date = { $gte: start, $lt: end };
  }

  // ?fromDate=2026-01-01&toDate=2026-12-31
  if (query.fromDate || query.toDate) {
    filter.date = filter.date || {};
    if (query.fromDate) filter.date.$gte = normalizeDate(query.fromDate);
    if (query.toDate) filter.date.$lte = dayRange(normalizeDate(query.toDate)).$lte;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = new RegExp(escaped, "i");
  }

  const [data, total] = await Promise.all([
    Holiday.find(filter).sort({ date: 1 }).skip(skip).limit(limit),
    Holiday.countDocuments(filter),
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

// Aj theke samner holiday gulo
const getUpcomingHolidays = async (limit = 5) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return await Holiday.find({ date: { $gte: today } })
    .sort({ date: 1 })
    .limit(limit);
};

const getSingleHoliday = async (id: string) => {
  return await findOrThrow(id);
};

const updateHoliday = async (id: string, payload: any) => {
  await findOrThrow(id);

  delete payload.createdBy;

  if (payload.name !== undefined && !String(payload.name).trim()) {
    throw new AppError(httpStatus.BAD_REQUEST, "Holiday name is required");
  }

  if (payload.date !== undefined) {
    payload.date = normalizeDate(payload.date);
    await ensureNoDuplicate(payload.date, id);
  }

  return await Holiday.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteHoliday = async (id: string) => {
  const holiday = await findOrThrow(id);
  await holiday.deleteOne();
  return holiday;
};

export const HolidayService = {
  createHoliday,
  getAllHolidays,
  getUpcomingHolidays,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
};
