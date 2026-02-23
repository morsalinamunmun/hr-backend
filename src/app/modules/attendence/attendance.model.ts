// // attendance.model.ts
// import { model, Schema } from "mongoose";

// interface IAttendance {
//   user_id: Schema.Types.ObjectId;
//   work_type: string;
//   date: string; // store date in YYYY-MM-DD format for easy querying
//   check_in?: {
//     timestamp: Date;
//     location: { latitude: number; longitude: number };
//   };
//   check_out?: {
//     timestamp: Date;
//     location: { latitude: number; longitude: number };
//   };
// }

// const attendanceSchema = new Schema<IAttendance>({
//   user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   work_type: { type: String, required: true },
//   date: { type: String, required: true },
//   check_in: {
//     timestamp: Date,
//     location: {
//       latitude: Number,
//       longitude: Number,
//     },
//   },
//   check_out: {
//     timestamp: Date,
//     location: {
//       latitude: Number,
//       longitude: Number,
//     },
//   },
// }, { timestamps: true, versionKey: false });

// export const Attendance = model<IAttendance>("Attendance", attendanceSchema);


import { Schema, model } from "mongoose";
import { IAttendance } from "./attendance.interface";

const locationSchema = new Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    work_type: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    check_in: {
      timestamp: Date,
      location: locationSchema,
      photo: String,
    },
    check_out: {
      timestamp: Date,
      location: locationSchema,
      photo: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Attendance = model<IAttendance>(
  "Attendance",
  attendanceSchema
);