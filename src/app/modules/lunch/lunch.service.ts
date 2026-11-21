/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { LunchOption } from "./lunch.interface";
import { Lunch } from "./lunch.model";

const USER_FIELDS = "name email employee_id phone picture";

const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

// "2026-11-21" ba ISO date -> "2026-11-21"
const normalizeDate = (value: any) => {
  if (!value) {
    throw new AppError(httpStatus.BAD_REQUEST, "Date is required");
  }
  const date = String(value).slice(0, 10);
  if (!DATE_REGEX.test(date)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid date, use YYYY-MM-DD");
  }
  return date;
};

// "yes" / "Yes" / true / 1 -> Yes,  "no" / false / 0 -> No
const normalizeLunch = (value: any): LunchOption => {
  const v = String(value ?? "").trim().toLowerCase();
  if (["yes", "true", "1"].includes(v)) return LunchOption.YES;
  if (["no", "false", "0"].includes(v)) return LunchOption.NO;
  throw new AppError(httpStatus.BAD_REQUEST, "Lunch must be Yes or No");
};

// ?date= / ?month= / ?fromDate=&toDate= theke date filter
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

// Nijer account theke entry (same date e abar dile update hobe)
const upsertMyLunch = async (userId: string, payload: any) => {
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const date = normalizeDate(payload.date);
  const lunch = normalizeLunch(payload.lunch);

  return await Lunch.findOneAndUpdate(
    { user: userId, date },
    { user: userId, date, lunch, count: lunch === LunchOption.YES ? 1 : 0 },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

// Nijer entry list + total lunch
const getMyLunch = async (userId: string, query: any) => {
  const filter: any = { user: userId };
  const dateFilter = buildDateFilter(query);
  if (dateFilter) filter.date = dateFilter;

  const data = await Lunch.find(filter).sort({ date: -1 });
  const totalLunch = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return { data, totalLunch };
};

// Admin: sob user er entry (date / month / user diye filter)
const getAllLunch = async (query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 50;
  const skip = (page - 1) * limit;

  const filter: any = {};
  const dateFilter = buildDateFilter(query);
  if (dateFilter) filter.date = dateFilter;
  if (query.user) filter.user = query.user;
  if (query.lunch) filter.lunch = normalizeLunch(query.lunch);

  const [data, total, totals] = await Promise.all([
    Lunch.find(filter)
      .populate("user", USER_FIELDS)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lunch.countDocuments(filter),
    Lunch.aggregate([
      {
        $match: {
          ...filter,
          ...(filter.user && { user: new Types.ObjectId(String(filter.user)) }),
        },
      },
      { $group: { _id: null, totalLunch: { $sum: "$count" } } },
    ]),
  ]);

  return {
    data,
    totalLunch: totals[0]?.totalLunch ?? 0,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

// Admin: summary
//  ?date=2026-11-21  -> oi diner mot lunch + ke ke Yes/No dilo
//  ?month=2026-11    -> user-wise mot lunch (month/range er jonno)
const getLunchSummary = async (query: any) => {
  const dateFilter = buildDateFilter(query);
  if (!dateFilter) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Provide date, month, or fromDate/toDate"
    );
  }

  if (typeof dateFilter === "string") {
    const entries = await Lunch.find({ date: dateFilter })
      .populate("user", USER_FIELDS)
      .sort({ createdAt: 1 });

    const yes = entries.filter((e) => e.lunch === LunchOption.YES);
    return {
      date: dateFilter,
      totalLunch: yes.length,
      yesCount: yes.length,
      noCount: entries.length - yes.length,
      entries,
    };
  }

  const perUser = await Lunch.aggregate([
    { $match: { date: dateFilter } },
    {
      $group: {
        _id: "$user",
        totalLunch: { $sum: "$count" },
        yesDays: { $sum: { $cond: [{ $eq: ["$lunch", LunchOption.YES] }, 1, 0] } },
        noDays: { $sum: { $cond: [{ $eq: ["$lunch", LunchOption.NO] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        name: "$user.name",
        employee_id: "$user.employee_id",
        email: "$user.email",
        totalLunch: 1,
        yesDays: 1,
        noDays: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  return {
    range: dateFilter,
    totalLunch: perUser.reduce((sum, u) => sum + u.totalLunch, 0),
    users: perUser,
  };
};

// Nijer entry delete (admin hole jekono entry)
const deleteLunch = async (id: string, userId: string, isAdmin: boolean) => {
  const entry = await Lunch.findById(id);
  if (!entry) {
    throw new AppError(httpStatus.NOT_FOUND, "Lunch entry not found");
  }
  if (!isAdmin && String(entry.user) !== String(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own lunch entry"
    );
  }
  await entry.deleteOne();
  return entry;
};

export const LunchService = {
  upsertMyLunch,
  getMyLunch,
  getAllLunch,
  getLunchSummary,
  deleteLunch,
};
