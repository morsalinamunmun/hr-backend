import { Schema, model } from "mongoose";
import {
  AdvanceSalaryStatus,
  IAdvanceSalary,
} from "./advanceSalary.interface";

const DeductionSchema = new Schema(
  {
    month: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const ActionBySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    name: String,
    date: Date,
  },
  { _id: false }
);

const AdvanceSalarySchema = new Schema<IAdvanceSalary>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee is required"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },

    installments: {
      type: Number,
      required: [true, "Number of installments is required"],
      min: [1, "Installments must be at least 1"],
    },

    deductionPerMonth: {
      type: Number,
      default: 0,
    },

    reason: {
      type: String,
      trim: true,
    },

    startMonth: String,

    paidInstallments: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    deductions: { type: [DeductionSchema], default: [] },

    status: {
      type: String,
      enum: Object.values(AdvanceSalaryStatus),
      default: AdvanceSalaryStatus.PENDING,
    },

    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: ActionBySchema,
    rejectedBy: ActionBySchema,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

AdvanceSalarySchema.index({ employee: 1, status: 1 });

export const AdvanceSalary = model<IAdvanceSalary>(
  "AdvanceSalary",
  AdvanceSalarySchema
);
