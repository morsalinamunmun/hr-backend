import { Schema, model } from "mongoose";
import {
  IRequisition,
  RequisitionStatus,
} from "./requisition.interface";

const ItemSchema = new Schema(
  {
    slNo: Number,

    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },

    unit: {
      type: String,
      trim: true,
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    remarks: String,
  },
  {
    _id: false,
  }
);

const ApprovalSchema = new Schema(
  {
    name: String,

    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    signature: String,

    date: Date,
  },
  {
    _id: false,
  }
);

const RequisitionSchema = new Schema<IRequisition>(
  {
    requisitionNo: {
      type: String,
      unique: true,
      required: true,
    },

    companyName: {
      type: String,
      default: "BMS TECH LOGISTICS LTD",
      trim: true,
    },

    department: {
      type: String,
      default: "All",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    items: {
      type: [ItemSchema],
      validate: {
        validator: (items: unknown[]) =>
          Array.isArray(items) && items.length > 0,
        message: "At least one item is required",
      },
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    requestedBy: {
      type: String,
      required: [true, "Requested by is required"],
      trim: true,
    },

    requestedByUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    checkedBy: ApprovalSchema,

    approvedBy: ApprovalSchema,

    rejectedBy: ApprovalSchema,

    rejectionReason: String,

    status: {
      type: String,
      enum: Object.values(RequisitionStatus),
      default: RequisitionStatus.PENDING,
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);

export const Requisition = model<IRequisition>(
  "Requisition",
  RequisitionSchema
);
