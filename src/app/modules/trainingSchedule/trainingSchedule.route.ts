import { Router } from "express";
import multer from "multer";
import { TrainingScheduleController } from "./trainingSchedule.controller";
import { auth } from "../auth/auth.middleware";

const router = Router();

// JSON ba multipart/form-data — dutoi kaj korbe (file nibe na)
const parseForm = multer().none();

// Calendar view (?month=2026-11, default cholti mash)
router.get("/calendar", auth(), TrainingScheduleController.getCalendar);

// Logged-in user je meeting e trainer/lead
router.get("/my", auth(), TrainingScheduleController.getMySchedules);

// List (date, month, fromDate, toDate, trainer, lead, status, meetingType, search)
router.get("/", auth(), TrainingScheduleController.getAllSchedules);

router.get("/:id", auth(), TrainingScheduleController.getSingleSchedule);

// Je kono logged-in user schedule set / edit korte parbe
router.post("/", auth(), parseForm, TrainingScheduleController.createSchedule);

router.patch(
  "/:id",
  auth(),
  parseForm,
  TrainingScheduleController.updateSchedule
);

// Status change (Completed / Cancelled ...) — trainer o korte parbe
router.patch(
  "/:id/status",
  auth(),
  parseForm,
  TrainingScheduleController.updateStatus
);

// Delete: je create koreche se, ba admin / super_admin (service e check hoy)
router.delete("/:id", auth(), TrainingScheduleController.deleteSchedule);

export const TrainingScheduleRoutes = router;
