import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { renderMailHtml, sendMail } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";

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
      enum: [ROLES.ADMIN, ROLES.MEMBER],
      default: ROLES.MEMBER,
    },
    profilePicture: { type: String, default: "user.jpg" },
    isActive: { type: Boolean, default: false },
    activationCode: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;
  user.password = encrypt(user.password);
  user.activationCode = encrypt(user.id);
  next();
});

userSchema.post("save", async function (doc, next) {
  try {
    const user = doc;
    console.log("Send email to:", user.email);

    const contentMail = await renderMailHtml("registration-success.ejs", {
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`,
    });

    await sendMail({
      from: EMAIL_SMTP_USER,
      to: user.email,
      subject: "Activation Email",
      html: contentMail,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    next();
  }
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;

  return user;
};

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
