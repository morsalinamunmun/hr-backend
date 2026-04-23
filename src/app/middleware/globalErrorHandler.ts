// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextFunction, Request, Response } from "express";
// import { envVars } from "../config/env";
// import AppError from "../errorHelpers/AppError";
// import mongoose from "mongoose";

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
//     let statusCode = 500
//     let message = "Something Went Wrong!!"
//     if (err instanceof AppError) {
//     statusCode = err.statusCode;
//     message = err.message;
//   }
//   //  Mongoose Validation Error FIX
//   else if (err instanceof mongoose.Error.ValidationError) {
//     statusCode = 400;
//     const errors = Object.values(err.errors).map((e: any) => e.message);
//     message = errors.join(", "); // clean message
//   }

//   //   JWT error (important)
//   else if (err.name === "JsonWebTokenError") {
//     statusCode = 401;
//     message = "Invalid token";
//   }

//   else if (err.name === "TokenExpiredError") {
//     statusCode = 401;
//     message = "Token expired";
//   }

//   //  fallback
//   else if (err instanceof Error) {
//     statusCode = 500;
//     message = err.message;
//   }

//     // if (err instanceof AppError) {
//     //     statusCode = err.statusCode
//     //     message = err.message
//     // } else if (err instanceof Error) {
//     //     statusCode = 500;
//     //     message = err.message
//     // }

//     res.status(statusCode).json({
//         success: false,
//         message,
//         err,
//         stack: envVars.NODE_ENV === "development" ? err.stack : null
//     })
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import mongoose from "mongoose";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something Went Wrong!";

  // 1️⃣ Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 2️⃣ Mongoose Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;

    const errors = Object.values(err.errors).map(
      (e: any) => e.message
    );

    message = errors.join(", ");
  }

  // 3️⃣ Mongoose Cast Error (invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // 4️⃣ JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // 5️⃣ fallback system error
  else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  if (!res.headersSent) {
  next(err);
}

  // 🔥 RESPONSE (safe production version)
  res.status(statusCode).json({
    success: false,
    message,
    ...(envVars.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};