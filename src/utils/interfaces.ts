import { Types } from "mongoose";
import { Request } from "express";

export interface IUser {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt?: string;
  activationCode?: string;
}

export interface IUserToken
  extends Omit<
    IUser,
    | "password"
    | "activationToken"
    | "isActive"
    | "profilePicture"
    | "email"
    | "username"
    | "fullName"
  > {
  id?: Types.ObjectId;
}

export interface IReqUser extends Request {
  user?: IUserToken;
}

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
