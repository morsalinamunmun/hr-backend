// import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

// export const generateToken = (payload: JwtPayload, secret: string, expiresIn: string) => {
//     const token = jwt.sign(payload, secret, {
//     expiresIn: expiresIn.trim()   
// } as SignOptions);

//     return token
// }

// export const verifyToken = (token: string, secret: string) => {

//     const verifiedToken = jwt.verify(token, secret);

//     return verifiedToken
// }

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string | number
) => {
  if (!expiresIn) {
    // fallback to 1 hour if not provided
    expiresIn = "1h";
  }

  const token = jwt.sign(payload, secret, {
    expiresIn: expiresIn, // jwt will accept both string and number
  } as SignOptions);

  return token;
};

export const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret);
  return verifiedToken;
};