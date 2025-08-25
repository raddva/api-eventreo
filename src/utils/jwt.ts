import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { SECRET } from "./env";
import { IUserToken } from "./interfaces";

export const generateToken = (user: IUserToken): string => {
  return jwt.sign(user, SECRET, { expiresIn: "1h" });
};

export const getUserData = (token: string): IUserToken => {
  try {
    const user = jwt.verify(token, SECRET) as IUserToken;
    return user;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    } else if (err instanceof JsonWebTokenError) {
      throw new Error("TOKEN_INVALID");
    } else {
      throw err;
    }
  }
};
