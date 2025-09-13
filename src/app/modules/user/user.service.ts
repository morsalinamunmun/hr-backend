
import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env"
import type { IUser, IUserAuth, UserRole } from "./user.interface"
import { UserStatus } from "./user.interface"
import { User } from "./user.model"
import AppError from "../../errorHelpers/AppError"

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload

  const isUserExist = await User.findOne({ email })
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

  const authProvider: IUserAuth = {
    provider: "credentials",
    providerId: email as string,
  }

  // Fixed: Changed 'auths' to 'auth' to match your schema
  const user = await User.create({
    email,
    password: hashedPassword,
    auth: [authProvider], // This was 'auths' before, should be 'auth'
    ...rest, // This includes the role from the request
  })

  return user
}

const getAllUsers = async () => {
  const users = await User.find({}).select("-password") // Exclude password from response
  const totalUsers = await User.countDocuments()
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  }
}

const blockUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === "ADMIN" as UserRole) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin user cannot be blocked");
  }

  user.isActive = UserStatus.BLOCKED; // UserStatus.BLOCKED
  await user.save();

  return user;
};

const unblockUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isActive = UserStatus.ACTIVE; // UserStatus.ACTIVE
  await user.save();

  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  blockUser,
  unblockUser
}
