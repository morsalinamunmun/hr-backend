import { Router } from "express";
import { AttendanceController } from "./attendance.controller";
// import { AttendanceController } from "./attendance.controller";

const router = Router();

router.post("/mark", AttendanceController.markAttendance);
router.get("/", AttendanceController.getAllAttendance);
router.get("/:userId", AttendanceController.getUserAttendance);
// Attendance record e remarks bosano / edit (id = attendance _id)
router.patch("/:id/remarks", AttendanceController.updateRemarks);

export const AttendanceRoutes = router;