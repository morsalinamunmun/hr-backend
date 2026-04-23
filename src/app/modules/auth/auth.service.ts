
// modules/auth/auth.service.ts
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, UserStatus, UserVerified } from "../user/user.interface";
import { User } from "../user/user.model";
import { generateToken } from "../../utils/jwt";


// const credentialsLogin = async (payload: Partial<IUser>) => {
//     const { email, password } = payload;

//     const isUserExist = await User.findOne({ email })

//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
//     }

//     const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

//     if (!isPasswordMatched) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//     }

//      //  Approval Check
//   if (isUserExist.isVerified !== UserVerified.APPROVED) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "Your account is pending approval."
//     );
//   }

//   //  Active / Block Check
//   if (isUserExist.isActive !== UserStatus.ACTIVE) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "Your account is blocked or inactive."
//     );
//   }

//     const jwtPayload = {
//         _id: isUserExist._id,
//         email: isUserExist.email,
//         role: isUserExist.role,
//         work_type: isUserExist.work_type, 
//     }
//     const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

//     return {
//         accessToken
//     }

// }

//user - login - token (email, role, _id) - booking / payment / booking / payment cancel - token 


const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  // Approval Check
  if (isUserExist.isVerified !== UserVerified.APPROVED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is pending approval."
    );
  }

  // Active Check
  if (isUserExist.isActive !== UserStatus.ACTIVE) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked or inactive."
    );
  }

  const jwtPayload = {
    _id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
    work_type: isUserExist.work_type,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken,
    user: {
      _id: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
      work_type: isUserExist.work_type,
      name: isUserExist.name,
      employee_id: isUserExist.employee_id,
    },
  };
};
export const AuthServices = {
    credentialsLogin
}