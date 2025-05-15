import mongoose from "mongoose";
import { UserRoleEnum, StatusEnum } from "../enums/enums.js";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    picture: { type: String, required: false },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.SUBSCRIBER,
    },
    address: { type: String, required: true },
    classification: { type: String, required: false },
    verified: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    subscription: { type: Boolean, required: true, default: false },
    expiryDate: { type: Date, default: null },
    isOnTrial: { type: Boolean, default: false }, 
    trialStartedAt: { type: Date, default: null },
    trialEndsAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
