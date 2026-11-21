import { Router } from "express";
import multer from "multer";
import { HolidayController } from "./holiday.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

// JSON ba multipart/form-data — dutoi kaj korbe (file nibe na)
const parseForm = multer().none();

// Sob logged-in user holiday dekhte parbe
router.get("/", auth(), HolidayController.getAllHolidays);
router.get("/upcoming", auth(), HolidayController.getUpcomingHolidays);
router.get("/:id", auth(), HolidayController.getSingleHoliday);

// Shudhu admin / super_admin holiday set korte parbe
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  parseForm,
  HolidayController.createHoliday
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  parseForm,
  HolidayController.updateHoliday
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  HolidayController.deleteHoliday
);

export const HolidayRoutes = router;
