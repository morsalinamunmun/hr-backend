import { Schema, model } from "mongoose";
import { IParcel, ParcelStatus } from "./parcel.interface";

const statusLogSchema = new Schema({
  status: { type: String, enum: Object.values(ParcelStatus), required: true },
  location: { type: String },
  note: { type: String },
  updatedBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const parcelSchema = new Schema<IParcel>({
  trackingId: { type: String, required: true, unique: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  fee: { type: Number, required: true },
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: Object.values(ParcelStatus),
    default: ParcelStatus.REQUESTED
  },
  statusLogs: [statusLogSchema],
  isBlocked: { type: Boolean, default: false },
}, {
  timestamps: true
});

export const Parcel = model<IParcel>("Parcel", parcelSchema);
