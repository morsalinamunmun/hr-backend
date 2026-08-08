import { Types } from "mongoose";

export interface IRequisitionItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  remarks?: string;
}

export interface IApproval {
  employee?: Types.ObjectId;
  signature?: string;
  approvedAt?: Date;
}

export interface IRequisition {
  requisitionNo: string;

  companyName: string;
  department: string;

  date: Date;

  items: IRequisitionItem[];

  grandTotal: number;

  requestedBy: IApproval;

  checkedBy?: IApproval;

  approvedBy?: IApproval;

  status:
    | "Pending"
    | "Checked"
    | "Approved"
    | "Rejected";

  remarks?: string;
}