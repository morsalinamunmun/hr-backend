// import { z } from "zod";

// export const createParcelZodSchema = z.object({
//   body: z.object({
//     receiverId: z.string(),
//     type: z.string(),
//     weight: z.number().positive(),
//     fee: z.number().nonnegative(),
//     deliveryDate: z.string().refine(date => !isNaN(Date.parse(date)), {
//       message: "Invalid date format",
//     }),
//   }),
// });


import { z } from "zod"

export const createParcelZodSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  type: z.string().min(1, "Parcel type is required"),
  weight: z.number().positive("Weight must be a positive number"),
  fee: z.number().nonnegative("Fee must be non-negative"),
  deliveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
})
