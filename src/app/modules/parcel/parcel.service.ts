// import { Parcel } from "./parcel.model";
// import { IParcel, ParcelStatus } from "./parcel.interface";
// import AppError from "../../errorHelpers/AppError";
// import httpStatus from "http-status-codes";
// import { generateTrackingId } from "../../utils/parcel.utils";

// const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
//   const trackingId = generateTrackingId();

//   const initialStatusLog = {
//     status: ParcelStatus.REQUESTED,
//     updatedBy: senderId,
//     timestamp: new Date()
//   };

//   const parcel = await Parcel.create({
//     ...payload,
//     trackingId,
//     senderId,
//     status: ParcelStatus.REQUESTED,
//     statusLogs: [initialStatusLog],
//   });

//   return parcel;
// };

// const getMyParcels = async (userId: string) => {
//   return await Parcel.find({ senderId: userId });
// };

// const cancelParcel = async (parcelId: string, userId: string) => {
//   const parcel = await Parcel.findById(parcelId);
//   if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

//   if (!parcel.senderId || parcel.senderId.toString() !== userId)
//     throw new AppError(httpStatus.FORBIDDEN, "You can't cancel this parcel");

//   if (parcel.status !== ParcelStatus.REQUESTED)
//     throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel dispatched parcel");

//   parcel.status = ParcelStatus.CANCELLED;
//   parcel.statusLogs.push({
//     status: ParcelStatus.CANCELLED,
//     updatedBy: userId,
//     timestamp: new Date()
//   });

//   return await parcel.save();
// };

// export const ParcelServices = {
//   createParcel,
//   getMyParcels,
//   cancelParcel
// };


import { Parcel } from "./parcel.model"
import { type IParcel, ParcelStatus } from "./parcel.interface"
import AppError from "../../errorHelpers/AppError"
import httpStatus from "http-status-codes"
import { generateTrackingId } from "../../utils/parcel.utils"

const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
  // Convert deliveryDate string to Date object
  const parcelData = {
    ...payload,
    deliveryDate: new Date(payload.deliveryDate as string  ),
  }

  const trackingId = generateTrackingId()

  const initialStatusLog = {
    status: ParcelStatus.REQUESTED,
    updatedBy: senderId,
    timestamp: new Date(),
  }

  const parcel = await Parcel.create({
    ...parcelData,
    trackingId,
    senderId,
    status: ParcelStatus.REQUESTED,
    statusLogs: [initialStatusLog],
  })

  return parcel
}

const getMyParcels = async (userId: string) => {
  return await Parcel.find({ senderId: userId }).populate("receiverId", "name email phone").sort({ createdAt: -1 })
}

const cancelParcel = async (parcelId: string, userId: string) => {
  const parcel = await Parcel.findById(parcelId)

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  if (!parcel.senderId || parcel.senderId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can't cancel this parcel")
  }

  if (parcel.status !== ParcelStatus.REQUESTED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel dispatched parcel")
  }

  parcel.status = ParcelStatus.CANCELLED
  parcel.statusLogs.push({
    status: ParcelStatus.CANCELLED,
    updatedBy: userId,
    timestamp: new Date(),
  })

  return await parcel.save()
}

export const ParcelServices = {
  createParcel,
  getMyParcels,
  cancelParcel,
}
