import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RequisitionService } from "./requisition.service";
import { REQUISITION_UPLOAD_PATH } from "./requisition.upload";

const getSignaturePath = (req: Request) =>
  req.file ? `${REQUISITION_UPLOAD_PATH}/${req.file.filename}` : undefined;

const createRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.createRequisition(
    req.body,
    req.user?.userId
  );

  res.status(201).json({
    success: true,
    message: "Requisition created successfully",
    data: result,
  });
});

const getAllRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.getAllRequisition(req.query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

const getSingleRequisition = catchAsync(
  async (req: Request, res: Response) => {
    const result = await RequisitionService.getSingleRequisition(
      req.params.id
    );

    res.json({
      success: true,
      data: result,
    });
  }
);

const updateRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.updateRequisition(
    req.params.id,
    { ...req.body }
  );

  res.json({
    success: true,
    message: "Updated Successfully",
    data: result,
  });
});

const checkRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.checkRequisition(
    req.params.id,
    req.user.userId,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Requisition verified successfully",
    data: result,
  });
});

const approveRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.approveRequisition(
    req.params.id,
    req.user.userId,
    req.body || {},
    getSignaturePath(req)
  );

  res.json({
    success: true,
    message: "Requisition approved successfully",
    data: result,
  });
});

const rejectRequisition = catchAsync(async (req: Request, res: Response) => {
  const result = await RequisitionService.rejectRequisition(
    req.params.id,
    req.user.userId,
    req.body || {}
  );

  res.json({
    success: true,
    message: "Requisition rejected",
    data: result,
  });
});

const deleteRequisition = catchAsync(async (req: Request, res: Response) => {
  await RequisitionService.deleteRequisition(req.params.id);

  res.json({
    success: true,
    message: "Deleted Successfully",
  });
});

export const RequisitionController = {
  createRequisition,
  getAllRequisition,
  getSingleRequisition,
  updateRequisition,
  checkRequisition,
  approveRequisition,
  rejectRequisition,
  deleteRequisition,
};
