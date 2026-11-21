/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import {
  IRequisition,
  IRequisitionItem,
  RequisitionStatus,
} from "./requisition.interface";
import { Requisition } from "./requisition.model";

// multipart/form-data te items JSON string hisebe ashte pare
const parseItems = (items: any): IRequisitionItem[] => {
  if (items === undefined || items === null || items === "") return [];

  let parsed = items;
  if (typeof items === "string") {
    try {
      parsed = JSON.parse(items);
    } catch {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid items format");
    }
  }

  if (!Array.isArray(parsed)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Items must be an array");
  }

  return parsed;
};

// Form er moto: Total Price = Quantity x Unit Price, Grand Total = sob Total Price er jogfol
const calculateItems = (items: IRequisitionItem[]) => {
  const calculated = items.map((item, index) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (!item.itemName || !String(item.itemName).trim()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1}: item name is required`
      );
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1}: invalid quantity`
      );
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Item ${index + 1}: invalid unit price`
      );
    }

    return {
      slNo: index + 1,
      itemName: String(item.itemName).trim(),
      quantity,
      unit: item.unit,
      unitPrice,
      totalPrice: Math.round(quantity * unitPrice * 100) / 100,
      remarks: item.remarks,
    };
  });

  const grandTotal =
    Math.round(
      calculated.reduce((sum, item) => sum + item.totalPrice, 0) * 100
    ) / 100;

  return { items: calculated, grandTotal };
};

// REQ-00001, REQ-00002 ... (delete hole o duplicate hobe na)
const generateRequisitionNo = async () => {
  const last = await Requisition.findOne(
    { requisitionNo: { $regex: /^REQ-\d+$/ } },
    { requisitionNo: 1 }
  )
    .sort({ requisitionNo: -1 })
    .lean();

  const lastNumber = last ? Number(last.requisitionNo.split("-")[1]) : 0;

  return `REQ-${String(lastNumber + 1).padStart(5, "0")}`;
};

const getUserName = async (userId?: string) => {
  if (!userId) return undefined;
  const user = await User.findById(userId).select("name").lean();
  return user?.name;
};

const findOrThrow = async (id: string) => {
  const requisition = await Requisition.findById(id);
  if (!requisition) {
    throw new AppError(httpStatus.NOT_FOUND, "Requisition not found");
  }
  return requisition;
};

// User shudhu requisition create korbe (kono signature lagbe na)
const createRequisition = async (payload: any, userId?: string) => {
  const { items, grandTotal } = calculateItems(parseItems(payload.items));

  if (!items.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "At least one item is required");
  }

  // requestedBy na dile logged-in user er name boshbe
  let requestedBy: string | undefined =
    typeof payload.requestedBy === "string"
      ? payload.requestedBy
      : payload.requestedBy?.name;

  if (!requestedBy) {
    requestedBy = await getUserName(userId);
  }

  if (!requestedBy) {
    throw new AppError(httpStatus.BAD_REQUEST, "Requested by is required");
  }

  const raw: Partial<IRequisition> = {
    requisitionNo: await generateRequisitionNo(),
    companyName: payload.companyName,
    department: payload.department,
    date: payload.date,
    items,
    grandTotal,
    requestedBy,
    requestedByUser: userId,
    requestedAt: payload.requestedAt || new Date(),
    status: RequisitionStatus.PENDING,
    remarks: payload.remarks,
  };

  // undefined field gula baad dei jate schema default kaj kore
  const data = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => value !== undefined)
  );

  return await Requisition.create(data);
};

const getAllRequisition = async (query: {
  page?: string;
  limit?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  department?: string;
  search?: string;
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

  if (query.status) {
    filter.status = query.status;
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { requisitionNo: regex },
      { requestedBy: regex },
      { "items.itemName": regex },
    ];
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
  return await findOrThrow(id);
};

const updateRequisition = async (id: string, payload: any) => {
  const requisition = await findOrThrow(id);

  if (
    requisition.status === RequisitionStatus.APPROVED ||
    requisition.status === RequisitionStatus.REJECTED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${requisition.status} requisition cannot be updated`
    );
  }

  // auto-generated / calculated field client theke change kora jabe na
  delete payload.requisitionNo;
  delete payload.grandTotal;
  // approval info shudhu check/approve/reject endpoint diye set hobe
  delete payload.checkedBy;
  delete payload.approvedBy;
  delete payload.rejectedBy;

  if (payload.items !== undefined) {
    const { items, grandTotal } = calculateItems(parseItems(payload.items));
    if (!items.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "At least one item is required"
      );
    }
    payload.items = items;
    payload.grandTotal = grandTotal;
  }

  if (payload.requestedBy && typeof payload.requestedBy !== "string") {
    payload.requestedBy = payload.requestedBy.name;
  }

  return await Requisition.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

// Admin verify korbe -> Checked By (Pending -> Checked), signature lagbe na
const checkRequisition = async (
  id: string,
  userId: string,
  payload: { name?: string; remarks?: string }
) => {
  const requisition = await findOrThrow(id);

  if (requisition.status !== RequisitionStatus.PENDING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Only pending requisition can be checked (current: ${requisition.status})`
    );
  }

  requisition.checkedBy = {
    name: payload.name || (await getUserName(userId)),
    employee: userId,
    date: new Date(),
  };
  requisition.status = RequisitionStatus.CHECKED;
  if (payload.remarks !== undefined) requisition.remarks = payload.remarks;

  return await requisition.save();
};

// Super admin signature diye approve korbe -> Approved By (Checked -> Approved)
const approveRequisition = async (
  id: string,
  userId: string,
  payload: { name?: string; remarks?: string },
  signature?: string
) => {
  if (!signature) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Signature is required to approve requisition"
    );
  }

  const requisition = await findOrThrow(id);

  if (requisition.status !== RequisitionStatus.CHECKED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      requisition.status === RequisitionStatus.PENDING
        ? "Requisition must be verified by admin before approval"
        : `Requisition already ${requisition.status.toLowerCase()}`
    );
  }

  requisition.approvedBy = {
    name: payload.name || (await getUserName(userId)),
    employee: userId,
    signature,
    date: new Date(),
  };
  requisition.status = RequisitionStatus.APPROVED;
  if (payload.remarks !== undefined) requisition.remarks = payload.remarks;

  return await requisition.save();
};

// Reject (Pending/Checked -> Rejected)
const rejectRequisition = async (
  id: string,
  userId: string,
  payload: { name?: string; reason?: string }
) => {
  const requisition = await findOrThrow(id);

  if (
    requisition.status !== RequisitionStatus.PENDING &&
    requisition.status !== RequisitionStatus.CHECKED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Requisition already ${requisition.status.toLowerCase()}`
    );
  }

  requisition.rejectedBy = {
    name: payload.name || (await getUserName(userId)),
    employee: userId,
    date: new Date(),
  };
  requisition.rejectionReason = payload.reason;
  requisition.status = RequisitionStatus.REJECTED;

  return await requisition.save();
};

const deleteRequisition = async (id: string) => {
  const requisition = await findOrThrow(id);
  await requisition.deleteOne();
  return requisition;
};

export const RequisitionService = {
  createRequisition,
  getAllRequisition,
  getSingleRequisition,
  updateRequisition,
  checkRequisition,
  approveRequisition,
  rejectRequisition,
  deleteRequisition,
};
