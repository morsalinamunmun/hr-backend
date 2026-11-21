import { Types } from "mongoose";

export interface IHoliday {
  name: string; // Holiday Name
  date: Date; // Date
  type: string; // Type (Public, Optional, Company ...)
  description?: string; // Description
  createdBy?: Types.ObjectId | string;
}
