/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQuery } from "../../types/bonus";
import { Bonus } from "./bonus.model";

// CREATE
const createBonus = async (payload: any) => {
  const result = await Bonus.create(payload);

  return {
    success: true,
    message: "Bonus created successfully",
    data: result,
  };
};

// GET ALL
// const getAllBonus = async () => {
//   const result = await Bonus.find().sort({ createdAt: -1 });

//   return {
//     success: true,
//     data: result,
//   };
// };
const getAllBonus = async (query: IQuery) => {
  const { page = 1, limit = 10, search, fromDate, toDate } = query;

  const skip = (page - 1) * limit;

  const filter: any = {};

  //  Search (name or employee id)
  if (search) {
    filter.$or = [
      { employee_name: { $regex: search, $options: "i" } },
      { employee_id: { $regex: search, $options: "i" } },
    ];
  }

  //  Date filter
  if (fromDate || toDate) {
    filter.date = {};

    if (fromDate) {
      filter.date.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.date.$lte = new Date(toDate);
    }
  }

  const data = await Bonus.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Bonus.countDocuments(filter);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// UPDATE
const updateBonus = async (id: string, payload: any) => {
  const result = await Bonus.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!result) {
    return { success: false, message: "Bonus not found" };
  }

  return {
    success: true,
    message: "Bonus updated successfully",
    data: result,
  };
};

// DELETE
const deleteBonus = async (id: string) => {
  const result = await Bonus.findByIdAndDelete(id);

  if (!result) {
    return { success: false, message: "Bonus not found" };
  }

  return {
    success: true,
    message: "Bonus deleted successfully",
  };
};

export const BonusService = {
  createBonus,
  getAllBonus,
  updateBonus,
  deleteBonus,
};