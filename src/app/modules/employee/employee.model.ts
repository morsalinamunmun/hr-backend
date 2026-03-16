// employee.model.ts

import mongoose, { Schema } from "mongoose";
import { IEmployee } from "./employee.interface";

const employeeSchema = new Schema<IEmployee>(
  {
    employee_name: { type: String, required: true },
    branch_name: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    employee_id: { type: String, required: true, unique: true },
    mobile_number: { type: String, required: true },
    designation: { type: String, required: true },
    joining_date: { type: Date, required: true },
    leave: { type: String, required: true },
    image: { type: String },
    address: { type: String, required: true },
    nid: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    blood_group: { type: String, required: true },
     status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>(
  "Employee",
  employeeSchema
);