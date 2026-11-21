import { Schema, model } from "mongoose";
import { ILunch, LunchOption } from "./lunch.interface";

const LunchSchema = new Schema<ILunch>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: [true, "Date is required"],
    },

    lunch: {
      type: String,
      enum: Object.values(LunchOption),
      required: [true, "Lunch (Yes/No) is required"],
    },

    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ek user er ek dine ekta-i entry
LunchSchema.index({ user: 1, date: 1 }, { unique: true });
LunchSchema.index({ date: 1 });

export const Lunch = model<ILunch>("Lunch", LunchSchema);
