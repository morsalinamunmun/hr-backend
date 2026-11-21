import { Types } from "mongoose";

export enum AdvanceSalaryStatus {
  PENDING = "Pending",
  APPROVED = "Approved", // kisti kata cholche
  REJECTED = "Rejected",
  COMPLETED = "Completed", // sob kisti shesh
}

export interface IAdvanceDeduction {
  month: string; // "YYYY-MM"
  amount: number;
  date: Date;
  note?: string;
}

export interface IActionBy {
  user?: Types.ObjectId | string;
  name?: string;
  date?: Date;
}

export interface IAdvanceSalary {
  employee: Types.ObjectId | string; // Employee _id
  amount: number; // Amount (৳)
  installments: number; // Number of Installments
  deductionPerMonth: number; // amount / installments (server calculate kore)
  reason?: string;

  startMonth?: string; // "YYYY-MM" — kon mash theke kata shuru

  paidInstallments: number;
  paidAmount: number;
  remainingAmount: number;
  deductions: IAdvanceDeduction[];

  status: AdvanceSalaryStatus;

  requestedBy?: Types.ObjectId | string; // User _id
  approvedBy?: IActionBy;
  rejectedBy?: IActionBy;
  rejectionReason?: string;
}
