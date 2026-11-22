import { Schema, model } from "mongoose";
import {
  ITrainingSchedule,
  MeetingType,
  TrainingStatus,
} from "./trainingSchedule.interface";

const TrainingScheduleSchema = new Schema<ITrainingSchedule>(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    companyName: { type: String, trim: true },
    customerPhone: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },

    date: {
      type: String,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: String,

    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trainer is required"],
    },
    lead: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    topic: { type: String, trim: true },
    meetingType: {
      type: String,
      enum: Object.values(MeetingType),
      default: MeetingType.ONLINE,
    },
    meetingLink: { type: String, trim: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(TrainingStatus),
      default: TrainingStatus.SCHEDULED,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TrainingScheduleSchema.index({ date: 1, startTime: 1 });
TrainingScheduleSchema.index({ trainer: 1, date: 1 });

export const TrainingSchedule = model<ITrainingSchedule>(
  "TrainingSchedule",
  TrainingScheduleSchema
);
