import { Router } from "express";
import { ParcelControllers } from "./parcel.controller";

import { UserRole } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createParcelZodSchema, updateParcelStatusZodSchema } from "./parcel.validation";
import { auth } from "../../middleware/auth";

const router = Router();

// router.post("", auth(UserRole.SENDER), validateRequest(createParcelZodSchema), ParcelControllers.createParcel);
// router.get("/me", auth(UserRole.SENDER), ParcelControllers.getMyParcels);
// router.patch("/cancel/:id", auth(UserRole.SENDER), ParcelControllers.cancelParcel);
// router.get(
//   "/:id/status-logs",
//   auth(UserRole.SENDER, UserRole.RECEIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
//   ParcelControllers.getParcelStatusLogs,
// )

// Sender only routes
router.post("", auth(UserRole.SENDER), validateRequest(createParcelZodSchema), ParcelControllers.createParcel)
router.get("/me", auth(UserRole.SENDER), ParcelControllers.getMySentParcels)
router.patch("/cancel/:id", auth(UserRole.SENDER), ParcelControllers.cancelParcel)

// Receiver only routes
router.get("/incoming", auth(UserRole.RECEIVER), ParcelControllers.getMyIncomingParcels)
router.patch("/confirm-delivery/:id", auth(UserRole.RECEIVER), ParcelControllers.confirmDelivery)
router.get("/delivery-history", auth(UserRole.RECEIVER), ParcelControllers.getMyDeliveryHistory)

// Admin only routes
router.get("/all", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ParcelControllers.getAllParcels)
router.patch(
  "/status/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateParcelStatusZodSchema),
  ParcelControllers.updateParcelStatus,
)
router.patch("/toggle-block/:id", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), ParcelControllers.toggleParcelBlock)

// Shared routes (Sender/Receiver/Admin)
router.get(
  "/:id/status-logs",
  auth(UserRole.SENDER, UserRole.RECEIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ParcelControllers.getParcelStatusLogs,
)

export const ParcelRoutes = router;
