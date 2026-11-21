import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { HolidayService } from "./holiday.service";

const createHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayService.createHoliday(
    req.body || {},
    req.user?.userId
  );

  res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    data: result,
  });
});

const getAllHolidays = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayService.getAllHolidays(req.query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

const getUpcomingHolidays = catchAsync(
  async (req: Request, res: Response) => {
    const result = await HolidayService.getUpcomingHolidays(
      Number(req.query.limit) || 5
    );

    res.json({
      success: true,
      data: result,
    });
  }
);

const getSingleHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayService.getSingleHoliday(req.params.id);

  res.json({
    success: true,
    data: result,
  });
});

const updateHoliday = catchAsync(async (req: Request, res: Response) => {
  const result = await HolidayService.updateHoliday(req.params.id, {
    ...(req.body || {}),
  });

  res.json({
    success: true,
    message: "Holiday updated successfully",
    data: result,
  });
});

const deleteHoliday = catchAsync(async (req: Request, res: Response) => {
  await HolidayService.deleteHoliday(req.params.id);

  res.json({
    success: true,
    message: "Holiday deleted successfully",
  });
});

export const HolidayController = {
  createHoliday,
  getAllHolidays,
  getUpcomingHolidays,
  getSingleHoliday,
  updateHoliday,
  deleteHoliday,
};
