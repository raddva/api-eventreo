import mongoose from "mongoose";

export interface IUser {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
  activationToken?: string;
}

const schema = new mongoose.Schema();

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    profilePicture: { type: String, default: "user.jpg" },
    isActive: { type: Boolean, default: false },
    activationToken: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
