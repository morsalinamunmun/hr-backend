/* eslint-disable @typescript-eslint/no-explicit-any */
import { Leave } from "./leave.model";
import { ILeave } from "./leave.interface";
import { Types } from "mongoose";

// export const createLeaveService = async (payload: ILeave) => {
//   return await Leave.create(payload);
// };
export const createLeaveService = async (payload: ILeave, userId: string) => {

  payload.employee = new Types.ObjectId(userId);

  return await Leave.create(payload);
};

// export const getLeavesService = async (userId: string) => {
//   return await Leave.find({ employee: userId }).sort({ createdAt: -1 });
// };
export const getLeavesService = async (
  userId: string,
  page: number,
  limit: number,
  fromDate?: string,
  toDate?: string
) => {
  const query: any = { employee: userId };

  // Date filter
  if (fromDate && toDate) {
    query.fromDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  const skip = (page - 1) * limit;

  const data = await Leave.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Leave.countDocuments(query);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// export const getAllLeavesService = async () => {
//   return await Leave.find().sort({ createdAt: -1 });
// };


export const getAllLeavesService = async (
  page = 1,
  limit = 10,
  fromDate?: string,
  toDate?: string
) => {
  const query: any = {};

  if (fromDate && toDate) {
    query.fromDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  const skip = (page - 1) * limit;

  const data = await Leave.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Leave.countDocuments(query);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateLeaveService = async (
  id: string,
  payload: Partial<ILeave>,
  userId: string,
  role: string,
  userName: string
) => {
  const leave = await Leave.findById(id);

  if (!leave) {
    throw new Error("Leave not found");
  }

  //  USER RULE
  if (role === "user") {
    //  অন্য কারো leave update করতে পারবে না
    if (leave.employee.toString() !== userId) {
      throw new Error("Not authorized");
    }

    //  approved/rejected হলে update করা যাবে না
    if (leave.status !== "pending") {
      throw new Error("Cannot edit approved/rejected leave");
    }

    //  user status change করতে পারবে না
    if (payload.status) {
      throw new Error("You cannot change leave status");
    }
  }

  //  ADMIN / SUPER ADMIN RULE
  if (role === "admin" || role === "super_admin") {
    if (payload.status === "approved" || payload.status === "rejected") {
      payload.approvedBy = userName;
    }
  }

  return await Leave.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteLeaveService = async (
  id: string,
  userId: string,
  role: string
) => {
  const leave = await Leave.findById(id);

  if (!leave) throw new Error("Leave not found");

  // user only own + pending delete করতে পারবে
  if (role === "user") {
    if (leave.employee.toString() !== userId) {
      throw new Error("Not authorized");
    }

    if (leave.status !== "pending") {
      throw new Error("Cannot delete approved/rejected leave");
    }
  }

  return await Leave.findByIdAndDelete(id);
};