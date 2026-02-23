import { Router } from "express";
import { UserControllers } from "./user.controller";
import { auth } from "../auth/auth.middleware";
import { UserRole } from "./user.interface";

const router = Router()


// router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)
// router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers) 
router.get("/users", UserControllers.getAllUsers) 
// /api/v1/user/:id
router.patch("/verify/:id", auth(UserRole.SUPER_ADMIN), UserControllers.verifyUser);
// Block / Unblock routes (only admin access ideally)
router.patch("/block/:id",  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserControllers.blockUser);
router.patch("/unblock/:id",  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), UserControllers.unblockUser);

export const UserRoutes = router