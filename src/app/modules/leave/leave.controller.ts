/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import * as LeaveService from "./leave.service";

// create leave
export const createLeave = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const leave = await LeaveService.createLeaveService(
  req.body,
    userId ,
  );

  res.status(201).json({
    success: true,
    data: leave,
  });
};

// export const getLeaves = async (req: any, res: Response) => {
//   const userId = req.user.userId;

//   const result = await LeaveService.getLeavesService(
//     userId,  
//   );

//   return res.json({
//     success: true,
//     data: result,
//   });
// };

// USER LEAVES (own)
export const getLeaves = async (req: any, res: Response) => {
  const userId = req.user.userId;

  const { page = 1, limit = 10, fromDate, toDate } = req.query;

  const result = await LeaveService.getLeavesService(
    userId,
    Number(page),
    Number(limit),
    fromDate,
    toDate
  );

  return res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

// ADMIN REPORT (all)
// export const getAllLeaves = async (req: any, res: Response) => {
//   const leaves = await LeaveService.getAllLeavesService();

//   return res.json({
//     success: true,
//     data: leaves,
//   });
// };

export const getAllLeaves = async (req: any, res: Response) => {
  const { page = 1, limit = 10, fromDate, toDate } = req.query;

  const result = await LeaveService.getAllLeavesService(
    Number(page),
    Number(limit),
    fromDate,
    toDate
  );

  return res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

// export const updateLeave = async (req: any, res: Response) => {
//   const leave = await LeaveService.updateLeaveService(
//     req.params.id,
//     req.body,
//     req.user.userId,
//     req.user.role,
//     req.user.name
//   );

//   res.json(leave);
// };

export const updateLeave = async (req: any, res: Response) => {
  try {
    const leave = await LeaveService.updateLeaveService(
      req.params.id,
      req.body,
      req.user.userId,
      req.user.role,
      req.user.name
    );

    res.json({
      success: true,
      data: leave,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLeave = async (req: any, res: Response) => {
  await LeaveService.deleteLeaveService(
    req.params.id,
    req.user.userId,
    req.user.role
  );

  res.json({ message: "Leave deleted" });
};