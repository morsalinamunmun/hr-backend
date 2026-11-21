import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserRole } from "../user/user.interface";
import { LunchService } from "./lunch.service";

const upsertMyLunch = catchAsync(async (req: Request, res: Response) => {
  const result = await LunchService.upsertMyLunch(
    req.user.userId,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Lunch entry saved successfully",
    data: result,
  });
});

const getMyLunch = catchAsync(async (req: Request, res: Response) => {
  const result = await LunchService.getMyLunch(req.user.userId, req.query);

  res.json({
    success: true,
    data: result.data,
    totalLunch: result.totalLunch,
  });
});

const getAllLunch = catchAsync(async (req: Request, res: Response) => {
  const result = await LunchService.getAllLunch(req.query);

  res.json({
    success: true,
    data: result.data,
    totalLunch: result.totalLunch,
    meta: result.meta,
  });
});

const getLunchSummary = catchAsync(async (req: Request, res: Response) => {
  const result = await LunchService.getLunchSummary(req.query);

  res.json({
    success: true,
    data: result,
  });
});

const deleteLunch = catchAsync(async (req: Request, res: Response) => {
  const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(
    req.user.role
  );
  await LunchService.deleteLunch(req.params.id, req.user.userId, isAdmin);

  res.json({
    success: true,
    message: "Lunch entry deleted successfully",
  });
});

export const LunchController = {
  upsertMyLunch,
  getMyLunch,
  getAllLunch,
  getLunchSummary,
  deleteLunch,
};
