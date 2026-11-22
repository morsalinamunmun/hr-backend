import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { UserRole } from "../user/user.interface";

export const auth = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;
    } catch {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    // req.user = decoded;
    req.user = {
      userId: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    // Role check try er baire: age eta catch e dhora pore "Invalid or expired token" (401)
    // hoye jeto, ar frontend 401 peye user ke logout kore dito.
    if (roles.length && !roles.includes(decoded.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Forbidden: Access denied");
    }

    next();
  };
};
