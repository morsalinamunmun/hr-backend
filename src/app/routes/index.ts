import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ParcelRoutes } from "../modules/parcel/parcel.route";

export const router = Router();

const modulesRoutes =[
    {
        path: "/user",
        route: UserRoutes
    },
    { path: "/auth", route: AuthRoutes },
     { path: "/parcels", route: ParcelRoutes },
]

modulesRoutes.forEach(route => router.use(route.path, route.route));