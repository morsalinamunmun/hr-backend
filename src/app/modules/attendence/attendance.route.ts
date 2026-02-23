import { Router } from "express";
import { AttendanceController } from "./attendance.controller";

const router = Router();

router.post("/mark", AttendanceController.markAttendance);
router.get("/:userId", AttendanceController.getUserAttendance);

export const AttendanceRoutes = router;