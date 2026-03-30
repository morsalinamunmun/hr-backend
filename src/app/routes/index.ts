import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { EmployeeRoutes } from "../modules/employee/employee.route";
import { LeaveRoutes } from "../modules/leave/leave.route";
import { AttendanceRoutes } from "../modules/attendence/attendance.route";

export const router = Router();

const modulesRoutes =[
    {
        path: "/user",
        route: UserRoutes
    },
    { path: "/auth", route: AuthRoutes },
     { path: "/attendance", route: AttendanceRoutes },
     { path: "/employees", route: EmployeeRoutes },
     { path: "/leaves", route: LeaveRoutes }
]

modulesRoutes.forEach(route => router.use(route.path, route.route));