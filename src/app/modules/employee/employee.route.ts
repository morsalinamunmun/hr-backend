// employee.route.ts

import express from "express";
import { EmployeeController } from "./employee.controller";

const router = express.Router();

// Admin / Super Admin
router.post("/", EmployeeController.createEmployee);
router.get("/", EmployeeController.getAllEmployees);
router.get("/:id", EmployeeController.getSingleEmployee);
router.patch("/:id", EmployeeController.updateEmployee);
// router.delete("/:id", EmployeeController.deleteEmployee);

// Employee self profile
// router.get("/me/profile", EmployeeController.getMyProfile);
// router.patch("/me/profile", EmployeeController.updateMyProfile);

export const EmployeeRoutes = router;