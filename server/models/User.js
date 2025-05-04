import mongoose from "mongoose";
import { UserRoleEnum, StatusEnum } from "../enums/enums.js"

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: false },
    picture: { type: String, required: false },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: "client",
    },
    address: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
    sessionToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
