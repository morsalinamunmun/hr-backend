/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import * as LeaveService from "./leave.service";

// create leave
export const createLeave = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const leave = await LeaveService.createLeaveService(
  req.body,
    userId ,
  );

  res.status(201).json({
    success: true,
    data: leave,
  });
};

export const getLeaves = async (req: any, res: Response) => {
  const userId = req.user.id;
  const role = req.user.role;

  const leaves = await LeaveService.getLeavesService(userId, role);

  res.json(leaves);
};

// export const updateLeave = async (req: Request, res: Response) => {
//   const leave = await LeaveService.updateLeaveService(
//     req.params.id,
//     req.body
//   );
//   res.json(leave);
// };

export const updateLeave = async (req: any, res: Response) => {
  const leave = await LeaveService.updateLeaveService(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role,
    req.user.name
  );

  res.json(leave);
};

export const deleteLeave = async (req: Request, res: Response) => {
  await LeaveService.deleteLeaveService(req.params.id);
  res.json({ message: "Leave deleted" });
};