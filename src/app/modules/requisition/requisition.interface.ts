import { Types } from "mongoose";

export enum RequisitionStatus {
  PENDING = "Pending",
  CHECKED = "Checked",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

// Purchase Details table er ek row
export interface IRequisitionItem {
  slNo?: number;
  itemName: string;
  quantity: number;
  unit?: string; // e.g. "Kg", "Pcs", "Box"
  unitPrice: number;
  totalPrice: number; // server calculate kore (quantity * unitPrice)
  remarks?: string;
}

// Approval Section er Checked By / Approved By / Rejected By
export interface IApproval {
  name?: string;
  employee?: Types.ObjectId | string; // User _id
  signature?: string; // signature image path
  date?: Date;
}

export interface IRequisition {
  requisitionNo: string;

  companyName: string;
  department: string;

  date: Date;

  items: IRequisitionItem[];

  grandTotal: number;

  // Requested By (name string rakha hoyeche ager data/frontend er sathe compatible rakhar jonno)
  requestedBy: string;
  requestedByUser?: Types.ObjectId | string;
  requestedAt?: Date;

  checkedBy?: IApproval;
  approvedBy?: IApproval;
  rejectedBy?: IApproval;
  rejectionReason?: string;

  status: RequisitionStatus;

  remarks?: string;
}
