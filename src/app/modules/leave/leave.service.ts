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

export const getLeavesService = async (
  userId: string,
  role: string
) => {
  if (role === "admin" || role === "super_admin") {
    return await Leave.find().sort({ createdAt: -1 });
  }

  return await Leave.find({ employee: userId }).sort({ createdAt: -1 });
};

// export const updateLeaveService = async (
//   id: string,
//   payload: Partial<ILeave>
// ) => {
//   return await Leave.findByIdAndUpdate(id, payload, { new: true });
// };
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

// export const deleteLeaveService = async (id: string) => {
//   return await Leave.findByIdAndDelete(id);
// };

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