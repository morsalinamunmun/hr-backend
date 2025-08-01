
import type { NextFunction, Request, Response } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { envVars } from "../config/env"
import { User } from "../modules/user/user.model"
import type { UserRole } from "../modules/user/user.interface"
import AppError from "../errorHelpers/AppError"
import httpStatus from "http-status-codes"

interface CustomJwtPayload extends JwtPayload {
  userId: string
  email: string
  role: UserRole
}

export const auth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized")
      }

      // Verify token
      const decoded = jwt.verify(token, envVars.JWT_ACCESS_SECRET as string) as CustomJwtPayload


      // Check if user exists
      const user = await User.findById(decoded.userId)
      if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User not found")
      }

      // Check if user is active
      if (user.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted")
      }

      // Check role authorization
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(httpStatus.FORBIDDEN, "You don't have permission to access this resource")
      }

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        id: decoded.userId, // Add this for backward compatibility
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
