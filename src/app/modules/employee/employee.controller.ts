// employee.controller.ts

import { Request, Response } from "express";
import { EmployeeService } from "./employee.service";

// Create
const createEmployee = async (req: Request, res: Response) => {
  const result = await EmployeeService.createEmployee(req.body);
  res.status(200).json(result);
};

// Get All
const getAllEmployees = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await EmployeeService.getAllEmployees(page, limit);
  res.status(200).json(result);
};

// Get Single
const getSingleEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EmployeeService.getSingleEmployee(id);
  res.status(200).json(result);
};

// Update
const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await EmployeeService.updateEmployee(id, req.body);
  res.status(200).json(result);
};

export const EmployeeController = {
  createEmployee,
  getAllEmployees,
  getSingleEmployee,
  updateEmployee,
};