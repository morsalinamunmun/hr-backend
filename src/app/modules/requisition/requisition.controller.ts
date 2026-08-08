import { Request, Response } from "express";
import { RequisitionService } from "./requisition.service";

const createRequisition = async (
  req: Request,
  res: Response
) => {
  const result =
    await RequisitionService.createRequisition(
      req.body
    );

  res.status(201).json({
    success: true,
    message: "Requisition created successfully",
    data: result,
  });
};

const getAllRequisition = async (
  req: Request,
  res: Response
) => {
  const result =
    await RequisitionService.getAllRequisition(req.query);

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
};

const getSingleRequisition = async (
  req: Request,
  res: Response
) => {
  const result =
    await RequisitionService.getSingleRequisition(
      req.params.id
    );

  res.json({
    success: true,
    data: result,
  });
};

const updateRequisition = async (
  req: Request,
  res: Response
) => {
  const result =
    await RequisitionService.updateRequisition(
      req.params.id,
      req.body
    );

  res.json({
    success: true,
    message: "Updated Successfully",
    data: result,
  });
};

const deleteRequisition = async (
  req: Request,
  res: Response
) => {
  await RequisitionService.deleteRequisition(
    req.params.id
  );

  res.json({
    success: true,
    message: "Deleted Successfully",
  });
};

export const RequisitionController = {
  createRequisition,
  getAllRequisition,
  getSingleRequisition,
  updateRequisition,
  deleteRequisition,
};