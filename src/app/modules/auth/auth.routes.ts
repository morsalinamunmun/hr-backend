import { Router } from "express";
import { AuthController } from "./auth.controller";
import { UserControllers } from "../user/user.controller";
import { createUserZodSchema } from "../user/user.validation";
import { validateRequest } from "../../middleware/validateRequest";


const router = Router()
router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)
router.post("/login", AuthController.credentialsLogin)

export const AuthRoutes = router;