/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)

    // Remove password from the response
    const { password, ...userWithoutPassword } = user.toObject();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: userWithoutPassword,
    })
})

const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.verifyUser(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User verified successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();

    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
})

// single user
const getMe = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.user, "REQ USER");
  const userId = req.user.userId; //  token থেকে আসবে
  const result = await UserServices.getUserById(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in user retrieved successfully",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const loggedInUserRole = req.user.role;
  const result = await UserServices.blockUser(id, loggedInUserRole);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User blocked successfully",
    data: result,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.unblockUser(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User unblocked successfully",
    data: result,
  });
});


export const UserControllers = {
    createUser,
    verifyUser,
    getAllUsers,
    getMe,
    blockUser,
    unblockUser
}

// route matching -> controller -> service -> model -> DB