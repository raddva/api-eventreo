import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel, {
  userDTO,
  userLoginDTO,
  userUpdatePasswordDTO,
} from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default {
  async updateProfile(req: IReqUser, res: Response) {
    /**
    #swagger.tags = ["Auth"]
    #swagger.security = [{
      "bearerAuth": {}
    }]
    #swagger.requestBody = {
        required: true,
        schema: {$ref: "#/components/schemas/UpdateProfileRequest"}
    }
    */
    try {
      const userId = req.user?.id;
      const { fullName, profilePicture } = req.body;
      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          fullName,
          profilePicture,
        },
        {
          new: true,
        }
      );

      if (!result) return response.notFound(res, "User not Found");

      response.success(res, result, "Success updating profile");
    } catch (error) {
      response.error(res, error, "Failed updating user profile");
    }
  },
  async updatePassword(req: IReqUser, res: Response) {
    /**
    #swagger.tags = ["Auth"]
    #swagger.security = [{
      "bearerAuth": {}
    }]
    #swagger.requestBody = {
        required: true,
        schema: {$ref: "#/components/schemas/UpdatePasswordRequest"}
    }
    */
    try {
      const userId = req.user?.id;
      const { oldPassword, password, confirmPassword } = req.body;
      await userUpdatePasswordDTO.validate({
        oldPassword,
        password,
        confirmPassword,
      });

      const user = await UserModel.findById(userId);

      if (!user || user.password !== encrypt(oldPassword))
        return response.notFound(res, "User not Found");

      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          password: encrypt(password),
        },
        {
          new: true,
        }
      );

      response.success(res, result, "Success update user password");
    } catch (error) {
      response.error(res, error, "Failed updating password");
    }
  },
  async register(req: Request, res: Response) {
    /**
    #swagger.tags = ["Auth"]
    #swagger.requestBody = {
        required: true,
        schema: {$ref: "#/components/schemas/RegisterRequest"}
    }
    */
    const { fullName, username, email, password, confirmPassword } = req.body;

    try {
      await userDTO.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      response.success(res, result, "Registration successful");
    } catch (e) {
      response.error(res, e, "Registration Failed");
    }
  },
  async login(req: Request, res: Response) {
    /**
     #swagger.tags = ["Auth"]
     #swagger.requestBody = {
          required: true,
          schema: {$ref: "#/components/schemas/LoginRequest"}
     }
     */
    try {
      const { identifier, password } = req.body;
      await userLoginDTO.validate({
        identifier,
        password,
      });

      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });

      if (!userByIdentifier) {
        return response.unauthorized(res, "User not found");
      }

      const validatedPassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatedPassword) {
        return response.unauthorized(res, "User not found");
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      return response.success(res, token, "Login successful");
    } catch (e) {
      response.error(res, e, "Registration Failed");
    }
  },

  async profile(req: IReqUser, res: Response) {
    /**
     #swagger.tags = ["Auth"] 
     #swagger.security = [{
      "bearerAuth": []
      }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "Profile fetched successfully");
    } catch (e) {
      response.error(res, e, "Failed fetching profile data");
    }
  },
  async activation(req: Request, res: Response) {
    /**
     #swagger.tags = ["Auth"]
     #swagger.requestBody = {
       required: true,
       schema: {$ref: "#/components/schemas/ActivationRequest"}
     }
     */
    try {
      const { code } = req.body as { code: string };
      const user = await UserModel.findOneAndUpdate(
        { activationCode: code },
        { isActive: true },
        { new: true }
      );

      response.success(res, user, "User Account activated successfully");
    } catch (e) {
      response.error(res, e, "User Activation Failed");
    }
  },
};
