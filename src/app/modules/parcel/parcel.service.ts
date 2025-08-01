/* eslint-disable @typescript-eslint/no-explicit-any */
// // import { Parcel } from "./parcel.model";
// // import { IParcel, ParcelStatus } from "./parcel.interface";
// // import AppError from "../../errorHelpers/AppError";
// // import httpStatus from "http-status-codes";
// // import { generateTrackingId } from "../../utils/parcel.utils";

// // const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
// //   const trackingId = generateTrackingId();

// //   const initialStatusLog = {
// //     status: ParcelStatus.REQUESTED,
// //     updatedBy: senderId,
// //     timestamp: new Date()
// //   };

// //   const parcel = await Parcel.create({
// //     ...payload,
// //     trackingId,
// //     senderId,
// //     status: ParcelStatus.REQUESTED,
// //     statusLogs: [initialStatusLog],
// //   });

// //   return parcel;
// // };

// // const getMyParcels = async (userId: string) => {
// //   return await Parcel.find({ senderId: userId });
// // };

// // const cancelParcel = async (parcelId: string, userId: string) => {
// //   const parcel = await Parcel.findById(parcelId);
// //   if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

// //   if (!parcel.senderId || parcel.senderId.toString() !== userId)
// //     throw new AppError(httpStatus.FORBIDDEN, "You can't cancel this parcel");

// //   if (parcel.status !== ParcelStatus.REQUESTED)
// //     throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel dispatched parcel");

// //   parcel.status = ParcelStatus.CANCELLED;
// //   parcel.statusLogs.push({
// //     status: ParcelStatus.CANCELLED,
// //     updatedBy: userId,
// //     timestamp: new Date()
// //   });

// //   return await parcel.save();
// // };

// // export const ParcelServices = {
// //   createParcel,
// //   getMyParcels,
// //   cancelParcel
// // };


// import { Parcel } from "./parcel.model"
// import { type IParcel, ParcelStatus } from "./parcel.interface"
// import AppError from "../../errorHelpers/AppError"
// import httpStatus from "http-status-codes"
// import { generateTrackingId } from "../../utils/parcel.utils"

// const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
//   // Convert deliveryDate string to Date object
//   const parcelData = {
//     ...payload,
//     deliveryDate: new Date(payload.deliveryDate as string  ),
//   }

//   const trackingId = generateTrackingId()

//   const initialStatusLog = {
//     status: ParcelStatus.REQUESTED,
//     updatedBy: senderId,
//     timestamp: new Date(),
//   }

//   const parcel = await Parcel.create({
//     ...parcelData,
//     trackingId,
//     senderId,
//     status: ParcelStatus.REQUESTED,
//     statusLogs: [initialStatusLog],
//   })

//   return parcel
// }

// const getMyParcels = async (userId: string) => {
//   return await Parcel.find({ senderId: userId }).populate("receiverId", "name email phone").sort({ createdAt: -1 })
// }

// const cancelParcel = async (parcelId: string, userId: string) => {
//   const parcel = await Parcel.findById(parcelId)

//   if (!parcel) {
//     throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
//   }

//   if (!parcel.senderId || parcel.senderId.toString() !== userId) {
//     throw new AppError(httpStatus.FORBIDDEN, "You can't cancel this parcel")
//   }

//   if (parcel.status !== ParcelStatus.REQUESTED) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel dispatched parcel")
//   }

//   parcel.status = ParcelStatus.CANCELLED
//   parcel.statusLogs.push({
//     status: ParcelStatus.CANCELLED,
//     updatedBy: userId,
//     timestamp: new Date(),
//   })

//   return await parcel.save()
// }

// export const ParcelServices = {
//   createParcel,
//   getMyParcels,
//   cancelParcel,
// }


import { Parcel } from "./parcel.model"
import { type IParcel, ParcelStatus } from "./parcel.interface"
import AppError from "../../errorHelpers/AppError"
import httpStatus from "http-status-codes"
import { generateTrackingId } from "../../utils/parcel.utils"
import { User } from "../user/user.model"
import { UserRole } from "../user/user.interface"
import mongoose from "mongoose"

// Sender only - Create parcel
const createParcel = async (payload: Partial<IParcel>, senderId: string) => {
  // Validate receiverId exists and is a valid user
  if (!mongoose.Types.ObjectId.isValid(payload.receiverId as string)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid receiver ID format")
  }

  const receiver = await User.findById(payload.receiverId)
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver not found")
  }

  if (receiver.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Receiver account is deleted")
  }

  // Check if receiver has receiver role
  if (receiver.role !== UserRole.RECEIVER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Selected user is not a receiver")
  }

  const parcelData = {
    ...payload,
    deliveryDate: new Date(payload.deliveryDate as string),
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

  await parcel.populate("receiverId", "name email phone")
  await parcel.populate("senderId", "name email phone")

  return parcel
}

// Sender only - Get my sent parcels
const getMySentParcels = async (senderId: string) => {
  return await Parcel.find({ senderId }).populate("receiverId", "name email phone").sort({ createdAt: -1 })
}

// Receiver only - Get my incoming parcels
const getMyIncomingParcels = async (receiverId: string) => {
  return await Parcel.find({ receiverId }).populate("senderId", "name email phone").sort({ createdAt: -1 })
}

// Receiver only - Confirm delivery
const confirmDelivery = async (parcelId: string, receiverId: string) => {
  if (!mongoose.Types.ObjectId.isValid(parcelId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid parcel ID format")
  }

  const parcel = await Parcel.findById(parcelId)

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  if (parcel.receiverId?.toString() !== receiverId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only confirm your own deliveries")
  }

  if (parcel.status !== ParcelStatus.IN_TRANSIT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel must be in transit to confirm delivery")
  }

  parcel.status = ParcelStatus.DELIVERED
  parcel.statusLogs.push({
    status: ParcelStatus.DELIVERED,
    updatedBy: receiverId,
    timestamp: new Date(),
    note: "Delivery confirmed by receiver",
  })

  return await parcel.save()
}

// Receiver only - Get delivery history
const getMyDeliveryHistory = async (receiverId: string) => {
  return await Parcel.find({
    receiverId,
    status: ParcelStatus.DELIVERED,
  })
    .populate("senderId", "name email phone")
    .sort({ updatedAt: -1 })
}

// Sender only - Cancel parcel (if not dispatched)
const cancelParcel = async (parcelId: string, senderId: string) => {
  if (!mongoose.Types.ObjectId.isValid(parcelId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid parcel ID format")
  }

  const parcel = await Parcel.findById(parcelId)

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  if (parcel.senderId?.toString() !== senderId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only cancel your own parcels")
  }

  if (parcel.status === ParcelStatus.DISPATCHED || parcel.status === ParcelStatus.IN_TRANSIT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel dispatched parcel")
  }

  if (parcel.status === ParcelStatus.DELIVERED || parcel.status === ParcelStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already completed or cancelled")
  }

  parcel.status = ParcelStatus.CANCELLED
  parcel.statusLogs.push({
    status: ParcelStatus.CANCELLED,
    updatedBy: senderId,
    timestamp: new Date(),
    note: "Cancelled by sender",
  })

  return await parcel.save()
}

// Admin only - Get all parcels with filters
const getAllParcels = async (query: any) => {
  const { status, page = 1, limit = 10, search } = query

  const filter: any = {}

  if (status) {
    filter.status = status
  }

  if (search) {
    filter.$or = [{ trackingId: { $regex: search, $options: "i" } }]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const parcels = await Parcel.find(filter)
    .populate("senderId", "name email phone")
    .populate("receiverId", "name email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))

  const total = await Parcel.countDocuments(filter)

  return {
    parcels,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  }
}

// Admin only - Update parcel status
const updateParcelStatus = async (
  parcelId: string,
  status: ParcelStatus,
  adminId: string,
  location?: string,
  note?: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(parcelId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid parcel ID format")
  }

  const parcel = await Parcel.findById(parcelId)

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  if (parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot update status of blocked parcel")
  }

  // Validate status transition
  const validTransitions: Record<ParcelStatus, ParcelStatus[]> = {
    [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
    [ParcelStatus.APPROVED]: [ParcelStatus.DISPATCHED, ParcelStatus.CANCELLED],
    [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.RETURNED],
    [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
    [ParcelStatus.DELIVERED]: [],
    [ParcelStatus.CANCELLED]: [],
    [ParcelStatus.RETURNED]: [ParcelStatus.REQUESTED],
  }

  if (!validTransitions[parcel.status].includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Cannot change status from ${parcel.status} to ${status}`)
  }

  parcel.status = status
  parcel.statusLogs.push({
    status,
    location,
    note,
    updatedBy: adminId,
    timestamp: new Date(),
  })

  return await parcel.save()
}

// Admin only - Block/Unblock parcel
const toggleParcelBlock = async (parcelId: string, adminId: string) => {
  if (!mongoose.Types.ObjectId.isValid(parcelId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid parcel ID format")
  }

  const parcel = await Parcel.findById(parcelId)

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  parcel.isBlocked = !parcel.isBlocked
  parcel.statusLogs.push({
    status: parcel.status,
    updatedBy: adminId,
    timestamp: new Date(),
    note: `Parcel ${parcel.isBlocked ? "blocked" : "unblocked"} by admin`,
  })

  return await parcel.save()
}

// Sender/Receiver/Admin - Get parcel status logs
const getParcelStatusLogs = async (parcelId: string, userId: string, userRole: UserRole) => {
  if (!mongoose.Types.ObjectId.isValid(parcelId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid parcel ID format")
  }

  const parcel = await Parcel.findById(parcelId)
    .populate("senderId", "name email phone")
    .populate("receiverId", "name email phone")

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found")
  }

  // Check access permissions
  const isSender = parcel.senderId && parcel.senderId.toString() === userId
  const isReceiver = parcel.receiverId && parcel.receiverId.toString() === userId
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN

  if (!isSender && !isReceiver && !isAdmin) {
    throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to view this parcel's status logs")
  }

  return {
    parcelId: parcel._id,
    trackingId: parcel.trackingId,
    currentStatus: parcel.status,
    sender: parcel.senderId,
    receiver: parcel.receiverId,
    statusLogs: parcel.statusLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    createdAt: parcel.createdAt,
    updatedAt: parcel.updatedAt,
  }
}

// Public - Track parcel by tracking ID
const trackParcelByTrackingId = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId })
    .populate("senderId", "name phone")
    .populate("receiverId", "name phone")

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found with this tracking ID")
  }

  return {
    trackingId: parcel.trackingId,
    currentStatus: parcel.status,
    type: parcel.type,
    weight: parcel.weight,
    deliveryDate: parcel.deliveryDate,
    sender: {
      name: parcel.senderId,
      phone: parcel.senderId,
    },
    receiver: {
      name: parcel.receiverId,
      phone: parcel.receiverId,
    },
    statusLogs: parcel.statusLogs.map((log) => ({
      status: log.status,
      location: log.location,
      timestamp: log.timestamp,
      note: log.note,
    })),
    isBlocked: parcel.isBlocked,
  }
}

export const ParcelServices = {
  createParcel,
  getMySentParcels,
  getMyIncomingParcels,
  confirmDelivery,
  getMyDeliveryHistory,
  cancelParcel,
  getAllParcels,
  updateParcelStatus,
  toggleParcelBlock,
  getParcelStatusLogs,
  trackParcelByTrackingId,
}
