import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router()


router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)
// router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers) 
router.get("/users", UserControllers.getAllUsers) 
// /api/v1/user/:id

// Block / Unblock routes (only admin access ideally)
router.patch("/block/:id", UserControllers.blockUser);
router.patch("/unblock/:id", UserControllers.unblockUser);

export const UserRoutes = router