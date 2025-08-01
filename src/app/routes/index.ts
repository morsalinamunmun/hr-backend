import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";

export const router = Router();

const modulesRoutes =[
    {
        path: "/user",
        route: UserRoutes
    }
]

modulesRoutes.forEach(route => router.use(route.path, route.route));