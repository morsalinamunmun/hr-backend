import express from "express";
import * as LeaveController from "./leave.controller";
import { auth } from "../auth/auth.middleware";

const router = express.Router();

router.post("/", auth(), LeaveController.createLeave);
router.get("/", auth(), LeaveController.getLeaves);
router.patch("/:id", auth(), LeaveController.updateLeave);
router.delete("/:id", auth(), LeaveController.deleteLeave);

export const LeaveRoutes = router;