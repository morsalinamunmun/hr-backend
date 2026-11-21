import { Schema, model } from "mongoose";
import { IHoliday } from "./holiday.interface";

const HolidaySchema = new Schema<IHoliday>(
  {
    name: {
      type: String,
      required: [true, "Holiday name is required"],
      trim: true,
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    type: {
      type: String,
      default: "Public",
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

HolidaySchema.index({ date: 1 });

export const Holiday = model<IHoliday>("Holiday", HolidaySchema);
