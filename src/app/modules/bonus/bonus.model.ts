import mongoose, { Schema } from "mongoose";

const bonusSchema = new Schema(
  {
    employee_id: { type: String, required: true },
    employee_name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Bonus = mongoose.model("Bonus", bonusSchema);