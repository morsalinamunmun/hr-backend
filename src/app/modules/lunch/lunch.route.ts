import { Router } from "express";
import multer from "multer";
import { LunchController } from "./lunch.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

// JSON ba multipart/form-data — dutoi kaj korbe (file nibe na)
const parseForm = multer().none();

const adminOnly = auth(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Nijer account theke entry: { date, lunch: "Yes" | "No" }
router.post("/", auth(), parseForm, LunchController.upsertMyLunch);

// Nijer entry + total lunch (?month=2026-11 / ?date= / ?fromDate=&toDate=)
router.get("/me", auth(), LunchController.getMyLunch);

// Admin: summary (?date=2026-11-21 ba ?month=2026-11)
router.get("/summary", adminOnly, LunchController.getLunchSummary);

// Admin: sob user er entry
router.get("/", adminOnly, LunchController.getAllLunch);

router.delete("/:id", auth(), LunchController.deleteLunch);

export const LunchRoutes = router;
