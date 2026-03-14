import { Schema, model } from "mongoose";
import { ILeave } from "./leave.interface";

const leaveSchema = new Schema<ILeave>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true },

    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    designation: { type: String, required: true },
    branchName: { type: String, required: true },

    leaveType: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: { type: Number, required: true },

    reason: { type: String, required: true },
    leaveAddress: { type: String, required: true },
    mobileNo: { type: String, required: true },

    rejoinDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: { type: String },
  },
  { timestamps: true }
);

export const Leave = model<ILeave>("Leave", leaveSchema);