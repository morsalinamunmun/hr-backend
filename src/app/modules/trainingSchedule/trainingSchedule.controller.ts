import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserRole } from "../user/user.interface";
import { TrainingScheduleService } from "./trainingSchedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.createSchedule(
    req.body || {},
    req.user?.userId
  );

  res.status(201).json({
    success: true,
    message: "Training schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.getAllSchedules(req.query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

const getCalendar = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.getCalendar({ ...req.query });

  res.json({
    success: true,
    data: result,
  });
});

const getMySchedules = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.getMySchedules(
    req.user.userId,
    req.query
  );

  res.json({
    success: true,
    data: result,
  });
});

const getSingleSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.getSingleSchedule(
    req.params.id
  );

  res.json({
    success: true,
    data: result,
  });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.updateSchedule(
    req.params.id,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Training schedule updated successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TrainingScheduleService.updateStatus(
    req.params.id,
    req.body?.status
  );

  res.json({
    success: true,
    message: "Status updated successfully",
    data: result,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
    req.user.role
  );
  await TrainingScheduleService.deleteSchedule(
    req.params.id,
    req.user.userId,
    isAdmin
  );

  res.json({
    success: true,
    message: "Training schedule deleted successfully",
  });
});

export const TrainingScheduleController = {
  createSchedule,
  getAllSchedules,
  getCalendar,
  getMySchedules,
  getSingleSchedule,
  updateSchedule,
  updateStatus,
  deleteSchedule,
};
