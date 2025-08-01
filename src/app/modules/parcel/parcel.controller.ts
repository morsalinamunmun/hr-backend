// import { Request, Response } from "express";
// import { ParcelServices } from "./parcel.service";
// import { sendResponse } from "../../utils/sendResponse";
// import httpStatus from "http-status-codes";
// import { catchAsync } from "../../utils/catchAsync";

// export const ParcelControllers = {
//   createParcel: catchAsync(async (req: Request, res: Response) => {
//     const senderId = req.user.id;
//     const result = await ParcelServices.createParcel(req.body, senderId);
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.CREATED,
//       message: "Parcel Created Successfully",
//       data: result,
//     });
//   }),

//   getMyParcels: catchAsync(async (req: Request, res: Response) => {
//     const senderId = req.user.id;
//     const result = await ParcelServices.getMyParcels(senderId);
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: "Sender's Parcels Retrieved",
//       data: result,
//     });
//   }),

//   cancelParcel: catchAsync(async (req: Request, res: Response) => {
//     const parcelId = req.params.id;
//     const userId = req.user.id;
//     const result = await ParcelServices.cancelParcel(parcelId, userId);
//     sendResponse(res, {
//       success: true,
//       statusCode: httpStatus.OK,
//       message: "Parcel Cancelled Successfully",
//       data: result,
//     });
//   }),
// };


import type { Request, Response } from "express"
import { ParcelServices } from "./parcel.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"

export const ParcelControllers = {
  // Sender only - Create parcel
  createParcel: catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId || req.user?.id || req.user?._id

    if (!senderId) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "User ID not found in token",
        data: null,
      })
    }

    const result = await ParcelServices.createParcel(req.body, senderId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Parcel Created Successfully",
      data: result,
    })
  }),

  // Sender only - Get my sent parcels
  getMySentParcels: catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.getMySentParcels(senderId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Sender's Parcels Retrieved",
      data: result,
    })
  }),

  // Receiver only - Get my incoming parcels
  getMyIncomingParcels: catchAsync(async (req: Request, res: Response) => {
    const receiverId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.getMyIncomingParcels(receiverId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Incoming Parcels Retrieved",
      data: result,
    })
  }),

  // Receiver only - Confirm delivery
  confirmDelivery: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id
    const receiverId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.confirmDelivery(parcelId, receiverId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Delivery Confirmed",
      data: result,
    })
  }),

  // Receiver only - Get delivery history
  getMyDeliveryHistory: catchAsync(async (req: Request, res: Response) => {
    const receiverId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.getMyDeliveryHistory(receiverId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Delivery History Retrieved",
      data: result,
    })
  }),

  // Sender only - Cancel parcel (if not dispatched)
  cancelParcel: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id
    const senderId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.cancelParcel(parcelId, senderId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Cancelled Successfully",
      data: result,
    })
  }),

  // Admin only - Get all parcels
  getAllParcels: catchAsync(async (req: Request, res: Response) => {
    const result = await ParcelServices.getAllParcels(req.query)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Parcels Retrieved",
      data: result,
    })
  }),

  // Admin only - Update parcel status
  updateParcelStatus: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id
    const adminId = req.user?.userId || req.user?.id || req.user?._id
    const { status, location, note } = req.body

    const result = await ParcelServices.updateParcelStatus(parcelId, status, adminId, location, note)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Status Updated Successfully",
      data: result,
    })
  }),

  // Admin only - Block/Unblock parcel
  toggleParcelBlock: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id
    const adminId = req.user?.userId || req.user?.id || req.user?._id
    const result = await ParcelServices.toggleParcelBlock(parcelId, adminId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Parcel ${result.isBlocked ? "Blocked" : "Unblocked"} Successfully`,
      data: result,
    })
  }),

  // Sender/Receiver/Admin - Get parcel status logs
  getParcelStatusLogs: catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id
    const userId = req.user?.userId || req.user?.id || req.user?._id
    const userRole = req.user?.role

    const result = await ParcelServices.getParcelStatusLogs(parcelId, userId, userRole)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Status Logs Retrieved Successfully",
      data: result,
    })
  }),

  // Public - Track parcel by tracking ID (optional)
  trackParcelByTrackingId: catchAsync(async (req: Request, res: Response) => {
    const { trackingId } = req.params
    const result = await ParcelServices.trackParcelByTrackingId(trackingId)

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel Tracking Information Retrieved",
      data: result,
    })
  }),
}
