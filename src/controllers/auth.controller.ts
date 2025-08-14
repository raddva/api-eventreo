import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required()
    .min(6, "Password must be at least 6 characters")
    .test(
      "at-least-one-uppercase-letter",
      "Password must contain at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test(
      "at-least-one-number",
      "Password must contain at least one number",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
      }
    ),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Passwords must match"),
});
export default {
  async register(req: Request, res: Response) {
    /**
    #swagger.tags = ["Auth"]
    #swagger.requestBody = {
        required: true,
        schema: {$ref: "#/components/schemas/RegisterRequest"}
    }
    */
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidationSchema.validate({
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

      res.status(200).json({
        message: "Registration successful",
        data: result,
      });
    } catch (e) {
      const err = e as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
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
    const { identifier, password } = req.body as unknown as TLogin;
    try {
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
        return res.status(403).json({ message: "User not found", data: null });
      }

      const validatedPassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatedPassword) {
        return res.status(403).json({ message: "User not found", data: null });
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      return res.status(200).json({ message: "Login successful", data: token });
    } catch (e) {
      const err = e as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
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

      return res
        .status(200)
        .json({ message: "Profile fetched successfully", data: result });
    } catch (e) {
      const err = e as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
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

      res.status(200).json({
        message: "User Account activated successfully",
        data: user,
      });
    } catch (e) {
      const err = e as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
};
