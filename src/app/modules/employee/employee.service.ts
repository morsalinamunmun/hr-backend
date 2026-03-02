// employee.service.ts

import { Employee } from "./employee.model";
import { IEmployee } from "./employee.interface";

// Create Employee
const createEmployee = async (payload: IEmployee) => {
  const existing = await Employee.findOne({
    $or: [
      { email: payload.email },
      { employee_id: payload.employee_id },
    ],
  });

  if (existing) {
    return { success: false, message: "Employee already exists" };
  }

  const result = await Employee.create(payload);

  return {
    success: true,
    message: "Employee created successfully",
    data: result,
  };
};

// Get All Employees with Pagination
// Get All Employees with Pagination
const getAllEmployees = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const total = await Employee.countDocuments();
  const employees = await Employee.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    success: true,
    data: employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get Single Employee
const getSingleEmployee = async (id: string) => {
  const result = await Employee.findById(id);

  if (!result) {
    return { success: false, message: "Employee not found" };
  }

  return {
    success: true,
    data: result,
  };
};

// Update Employee
const updateEmployee = async (id: string, payload: Partial<IEmployee>) => {
  const result = await Employee.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!result) {
    return { success: false, message: "Employee not found" };
  }

  return {
    success: true,
    message: "Employee updated successfully",
    data: result,
  };
};

export const EmployeeService = {
  createEmployee,
  getAllEmployees,
  getSingleEmployee,
  updateEmployee,
};