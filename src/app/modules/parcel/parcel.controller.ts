import { Request, Response } from "express";
import { ParcelServices } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";

export const ParcelControllers = {
  createParcel: catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user.id;
    const result = await ParcelServices.createParcel(req.body, senderId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Parcel Created Successfully",
      data: result,
    });
  }),

  getMyParcels: catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user.id;
    const result = await ParcelServices.getMyParcels(senderId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Sender's Parcels Retrieved",
      data: result,
    });
  }),

  cancelParcel: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id;
    const userId = req.user.id;
    const result = await ParcelServices.cancelParcel(parcelId, userId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Cancelled Successfully",
      data: result,
    });
  }),
};
