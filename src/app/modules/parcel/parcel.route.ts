import { Router } from "express";
import { ParcelControllers } from "./parcel.controller";

import { UserRole } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createParcelZodSchema } from "./parcel.validation";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("", auth(UserRole.SENDER), validateRequest(createParcelZodSchema), ParcelControllers.createParcel);
router.get("/me", auth(UserRole.SENDER), ParcelControllers.getMyParcels);
router.patch("/cancel/:id", auth(UserRole.SENDER), ParcelControllers.cancelParcel);

export const ParcelRoutes = router;
