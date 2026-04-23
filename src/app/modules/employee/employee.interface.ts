// employee.interface.ts

import { Document } from "mongoose";

export interface IEmployee extends Document {
  employee_name: string;
  branch_name: string;
  department: string;
  email: string;
  employee_id: string;
  mobile_number: string;
  designation: string;
  joining_date: Date;
  leave: string;
  image?: string;
  address: string;
  basic_salary: number;
  nid: string;
  gender: "Male" | "Female" | "Other";
  blood_group: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "Active" | "Inactive";
}