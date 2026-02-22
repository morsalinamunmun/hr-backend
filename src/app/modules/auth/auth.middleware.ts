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
    const decoded = jwt.verify(token, envVars.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = decoded;
    if (decoded.isVerified === "PENDING") {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Your account is waiting for super admin approval.",
      );
    }

    if (decoded.isActive === "BLOCKED") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is blocked.");
    }

    if (decoded.isActive === "INACTIVE") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is inactive.");
    }
    try {
      const decoded = jwt.verify(
        token,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden: Access denied");
      }

      next();
    } catch {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
    }
  };
};
