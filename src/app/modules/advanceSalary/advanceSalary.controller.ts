import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AdvanceSalaryService } from "./advanceSalary.service";

const createAdvanceSalary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvanceSalaryService.createAdvanceSalary(
    req.body || {},
    req.user?.userId
  );

  res.status(201).json({
    success: true,
    message: "Advance salary requested successfully",
    data: result,
  });
});

const getAllAdvanceSalary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvanceSalaryService.getAllAdvanceSalary(req.query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

const getEmployeeAdvanceSalary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdvanceSalaryService.getEmployeeAdvanceSalary(
      req.params.employeeId
    );

    res.json({
      success: true,
      data: result,
    });
  }
);

const getSingleAdvanceSalary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdvanceSalaryService.getSingleAdvanceSalary(
      req.params.id
    );

    res.json({
      success: true,
      data: result,
    });
  }
);

const updateAdvanceSalary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvanceSalaryService.updateAdvanceSalary(
    req.params.id,
    { ...(req.body || {}) }
  );

  res.json({
    success: true,
    message: "Advance salary updated successfully",
    data: result,
  });
});

const approveAdvanceSalary = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdvanceSalaryService.approveAdvanceSalary(
      req.params.id,
      req.user.userId,
      req.body || {}
    );

    res.json({
      success: true,
      message: "Advance salary approved",
      data: result,
    });
  }
);

const rejectAdvanceSalary = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvanceSalaryService.rejectAdvanceSalary(
    req.params.id,
    req.user.userId,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Advance salary rejected",
    data: result,
  });
});

const addDeduction = catchAsync(async (req: Request, res: Response) => {
  const result = await AdvanceSalaryService.addDeduction(
    req.params.id,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Installment deducted successfully",
    data: result,
  });
});

const deleteAdvanceSalary = catchAsync(async (req: Request, res: Response) => {
  await AdvanceSalaryService.deleteAdvanceSalary(req.params.id);

  res.json({
    success: true,
    message: "Advance salary deleted successfully",
  });
});

export const AdvanceSalaryController = {
  createAdvanceSalary,
  getAllAdvanceSalary,
  getEmployeeAdvanceSalary,
  getSingleAdvanceSalary,
  updateAdvanceSalary,
  approveAdvanceSalary,
  rejectAdvanceSalary,
  addDeduction,
  deleteAdvanceSalary,
};
