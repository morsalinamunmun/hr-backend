import express from "express";
import * as LeaveController from "./leave.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "../user/user.interface";
import { uploadLeaveAttachment } from "../../middleware/upload";

const router = express.Router();

router.post("/", auth(), uploadLeaveAttachment.single("attachment"), LeaveController.createLeave);
// USER: only own leaves
router.get("/", auth(), LeaveController.getLeaves);

// ADMIN: all leaves (REPORT)
router.get("/report", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), LeaveController.getAllLeaves);
router.patch("/:id", auth(), uploadLeaveAttachment.single("attachment"), LeaveController.updateLeave);
router.delete("/:id", auth(), LeaveController.deleteLeave);

export const LeaveRoutes = router;