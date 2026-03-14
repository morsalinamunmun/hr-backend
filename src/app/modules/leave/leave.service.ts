import { Leave } from "./leave.model";
import { ILeave } from "./leave.interface";

export const createLeaveService = async (payload: ILeave) => {
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

export const updateLeaveService = async (
  id: string,
  payload: Partial<ILeave>
) => {
  return await Leave.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteLeaveService = async (id: string) => {
  return await Leave.findByIdAndDelete(id);
};