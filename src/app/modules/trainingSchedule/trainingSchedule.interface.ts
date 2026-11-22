import { Types } from "mongoose";

export enum TrainingStatus {
  SCHEDULED = "Scheduled",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  RESCHEDULED = "Rescheduled",
}

export enum MeetingType {
  ONLINE = "Online",
  ONSITE = "Onsite",
  PHONE = "Phone",
}

export interface ITrainingSchedule {
  // Customer info
  customerName: string;
  companyName?: string;
  customerPhone?: string;
  customerEmail?: string;

  // Kon tarikh e, kon shomoy
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm" (24h)
  endTime?: string; // "HH:mm" (24h)

  // Ke meeting nibe
  trainer: Types.ObjectId | string; // User _id
  lead?: Types.ObjectId | string; // User _id (optional)

  topic?: string;
  meetingType: MeetingType;
  meetingLink?: string; // Online hole
  location?: string; // Onsite hole
  notes?: string;

  status: TrainingStatus;

  createdBy?: Types.ObjectId | string;
}
