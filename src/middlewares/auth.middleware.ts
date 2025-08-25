import { Request, Response, NextFunction } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import jwt from "jsonwebtoken";

export default (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return response.unauthorized(res, "Missing authorization header");
  }

  const [prefix, token] = authorization.split(" ");
  if (!(prefix === "Bearer" && token)) {
    return response.unauthorized(res, "Invalid authorization format");
  }

  try {
    const user = getUserData(token);
    if (!user) {
      return response.unauthorized(res, "Invalid token");
    }

    (req as IReqUser).user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return response.unauthorized(res, "Token has expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return response.unauthorized(res, "Invalid token");
    }
    return response.error(res, err, "Failed to authenticate token");
  }
};
