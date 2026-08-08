/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRequisition } from "./requisition.interface";
import { Requisition } from "./requisition.model";

// const createRequisition = async (
//   payload: IRequisition
// ) => {
//   payload.grandTotal = payload.items.reduce(
//     (sum, item) => sum + item.totalPrice,
//     0
//   );

//   return await Requisition.create(payload);
// };

const createRequisition = async (payload: IRequisition) => {
  payload.grandTotal = payload.items.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  // Auto-generate requisitionNo instead of requiring it from the client
  const count = await Requisition.countDocuments();
  payload.requisitionNo = `REQ-${String(count + 1).padStart(5, '0')}`;

  return await Requisition.create(payload);
};

const getAllRequisition = async (query: {
  page?: string;
  limit?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.fromDate || query.toDate) {
    filter.createdAt = {};

    if (query.fromDate) {
      filter.createdAt.$gte = new Date(query.fromDate);
    }

    if (query.toDate) {
      const endDate = new Date(query.toDate);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
  }

  const [data, total] = await Promise.all([
    Requisition.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Requisition.countDocuments(filter),
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

const getSingleRequisition = async (id: string) => {
  return await Requisition.findById(id);
};

const updateRequisition = async (
  id: string,
  payload: Partial<IRequisition>
) => {
  if (payload.items) {
    payload.grandTotal = payload.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
  }

  return await Requisition.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
    }
  );
};

const deleteRequisition = async (id: string) => {
  return await Requisition.findByIdAndDelete(id);
};

export const RequisitionService = {
  createRequisition,
  getAllRequisition,
  getSingleRequisition,
  updateRequisition,
  deleteRequisition,
};