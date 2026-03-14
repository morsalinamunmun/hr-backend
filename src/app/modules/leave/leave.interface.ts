import { Types } from "mongoose";

export interface ILeave {
  employee: Types.ObjectId;

  employeeName: string;
  employeeId: string;
  designation: string;
  branchName: string;

  leaveType: string;
  fromDate: Date;
  toDate: Date;
  days: number;

  reason: string;
  leaveAddress: string;
  mobileNo: string;

  rejoinDate: Date;

  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
}