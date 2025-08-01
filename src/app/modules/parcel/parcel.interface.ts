export enum ParcelStatus {
  REQUESTED = 'Requested',
  APPROVED = 'Approved',
  DISPATCHED = 'Dispatched',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

export interface IStatusLog {
  status: ParcelStatus;
  location?: string;
  note?: string;
  updatedBy: string; // userId or system
  timestamp: Date;
}

export interface IParcel {
  trackingId: string;
  senderId?: string;
  receiverId?: string;
  type: string;
  weight: number;
  fee: number;
  deliveryDate: Date;
  status: ParcelStatus;
  statusLogs: IStatusLog[];
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
