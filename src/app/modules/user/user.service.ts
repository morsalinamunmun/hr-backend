// import bcryptjs from "bcryptjs";
// import httpStatus from "http-status-codes";
// import { JwtPayload } from "jsonwebtoken";
// import { envVars } from "../../config/env";
// import { IUser, IUserAuth, UserRole } from "./user.interface";
// import { User } from "./user.model";
// import AppError from "../../errorHelpers/AppError";

// const createUser = async (payload: Partial<IUser>) => {
//     console.log("Full Payload:", payload);

//     const { email, password, role, ...rest } = payload;
//      console.log("Creating user with:", { email, password, role, ...rest });

//     const isUserExist = await User.findOne({ email })

//     if (isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
//     }

//     const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

//     const authProvider: IUserAuth = { provider: "credentials", providerId: email as string }


//     const user = await User.create({
//         email,
//         password: hashedPassword,
//         auth: [authProvider],
//         ...rest
//     })

//     return user

// }

// const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

//     const ifUserExist = await User.findById(userId);

//     if (!ifUserExist) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }

//     /**
//      * email - can not update
//      * name, phone, password address
//      * password - re hashing
//      *  only admin superadmin - role, isDeleted...
//      * 
//      * promoting to superadmin - superadmin
//      */

//     if (payload.role) {
//         if (decodedToken.role === UserRole.USER || decodedToken.role === UserRole.GUIDE) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }

//         if (payload.role === UserRole.SUPER_ADMIN && decodedToken.role === UserRole.ADMIN) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.isActive || payload.isDeleted || payload.isVerified) {
//         if (decodedToken.role === UserRole.USER || decodedToken.role === UserRole.GUIDE) {
//             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
//         }
//     }

//     if (payload.password) {
//         payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
//     }

//     const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

//     return newUpdatedUser
// }


// const getAllUsers = async () => {
//     const users = await User.find({});
//     const totalUsers = await User.countDocuments();
//     return {
//         data: users,
//         meta: {
//             total: totalUsers
//         }
//     }
// };

// export const UserServices = {
//     createUser,
//     getAllUsers,
//     updateUser
// }


import bcryptjs from "bcryptjs"
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env"
import type { IUser, IUserAuth } from "./user.interface"
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

export const UserServices = {
  createUser,
  getAllUsers
}
