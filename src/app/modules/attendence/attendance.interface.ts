import { Types } from "mongoose";

export interface ILocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IAttendance {
  user_id: Types.ObjectId;
  work_type: string;
  date: string;

  check_in?: {
    timestamp: Date;
    location: ILocation;
    photo?: string;
  };

  check_out?: {
    timestamp: Date;
    location: ILocation;
    photo?: string;
  };
}