import mongoose from "mongoose";
import { PaymentMethodEnum, StatusEnum } from "../enums/enums.js";

const PaymentAccountSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: function () {
        return this.method === PaymentMethodEnum.BANK;
      },
    },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentAccount", PaymentAccountSchema);

