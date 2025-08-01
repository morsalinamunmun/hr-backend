
import { z } from "zod"
import { ParcelStatus } from "./parcel.interface"
import mongoose from "mongoose"

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24
}

// export const createParcelZodSchema = z.object({
//   receiverId: z.string().min(1, "Receiver ID is required"),
//   type: z.string().min(1, "Parcel type is required"),
//   weight: z.number().positive("Weight must be a positive number"),
//   fee: z.number().nonnegative("Fee must be non-negative"),
//   deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
//     message: "Invalid date format",
//   }),
// })

export const createParcelZodSchema = z.object({
  receiverId: z
    .string()
    .min(1, "Receiver ID is required")
    .refine((id) => isValidObjectId(id), {
      message: "Invalid receiver ID format. Must be a valid MongoDB ObjectId (24 characters)",
    }),
  type: z.string().min(1, "Parcel type is required"),
  weight: z.number().positive("Weight must be a positive number"),
  fee: z.number().nonnegative("Fee must be non-negative"),
  deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
})


export const updateParcelStatusZodSchema = z.object({
  status: z.enum(Object.values(ParcelStatus) as [string, ...string[]]),
  location: z.string().optional(),
  note: z.string().optional(),
})