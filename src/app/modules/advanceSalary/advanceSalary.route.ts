import { Router } from "express";
import multer from "multer";
import { AdvanceSalaryController } from "./advanceSalary.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "../user/user.interface";

const router = Router();

// JSON ba multipart/form-data — dutoi kaj korbe (file nibe na)
const parseForm = multer().none();

const adminOnly = auth(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Request Advance Salary (logged-in user)
router.post("/", auth(), parseForm, AdvanceSalaryController.createAdvanceSalary);

router.get("/", auth(), AdvanceSalaryController.getAllAdvanceSalary);

router.get(
  "/employee/:employeeId",
  auth(),
  AdvanceSalaryController.getEmployeeAdvanceSalary
);

router.get("/:id", auth(), AdvanceSalaryController.getSingleAdvanceSalary);

// Pending obosthay edit
router.patch(
  "/:id",
  auth(),
  parseForm,
  AdvanceSalaryController.updateAdvanceSalary
);

// Admin: approve / reject
router.patch(
  "/:id/approve",
  adminOnly,
  parseForm,
  AdvanceSalaryController.approveAdvanceSalary
);

router.patch(
  "/:id/reject",
  adminOnly,
  parseForm,
  AdvanceSalaryController.rejectAdvanceSalary
);

// Admin: protimash er kisti kata
router.post(
  "/:id/deduct",
  adminOnly,
  parseForm,
  AdvanceSalaryController.addDeduction
);

router.delete("/:id", adminOnly, AdvanceSalaryController.deleteAdvanceSalary);

export const AdvanceSalaryRoutes = router;
