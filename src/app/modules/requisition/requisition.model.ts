import { Schema, model } from "mongoose";
import { IRequisition } from "./requisition.interface";

const ItemSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    remarks: String,
  },
  {
    _id: false,
  }
);

const ApprovalSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    signature: String,

    approvedAt: Date,
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

    // companyName: {
    //   type: String,
    //   required: true,
    // },

    department: {
      type: String,
      required: false,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    items: [ItemSchema],

    grandTotal: {
      type: Number,
      default: 0,
    },

    // requestedBy: ApprovalSchema,
    requestedBy: {
  type: String,
  required: true,
},

    // checkedBy: ApprovalSchema,

    approvedBy: ApprovalSchema,

    status: {
      type: String,
      enum: [
        "Pending",
        // "Checked",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    remarks: String,
  },
  {
    timestamps: true,
  }
);

export const Requisition =
  model<IRequisition>("Requisition", RequisitionSchema);