import { model, Schema } from "mongoose";

interface IAttendance {
  user_id: Schema.Types.ObjectId;
  work_type: string;
  date: string; // store date in YYYY-MM-DD format for easy querying
  check_in?: {
    timestamp: Date;
    location: { latitude: number; longitude: number };
  };
  check_out?: {
    timestamp: Date;
    location: { latitude: number; longitude: number };
  };
}

const attendanceSchema = new Schema<IAttendance>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  work_type: { type: String, required: true },
  date: { type: String, required: true },
  check_in: {
    timestamp: Date,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  check_out: {
    timestamp: Date,
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
}, { timestamps: true, versionKey: false });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
