import express from "express";
import {
  register,
  login,
  googleLogin,
  pay,
  generateQR,
} from "../controllers/userController.js";
import { getBalance, topUp } from "../controllers/balanceController.js";
import {
  getAllPaymentMethods,
  createPaymentMethod,
} from "../controllers/paymentMethodController.js";
import { processPayment } from "../controllers/paymentDetailController.js";

const router = express.Router();

// user
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/pay", pay);
router.post("/generate-qr/:userId", generateQR);

// balance
router.get("/check-balance/:userId", getBalance);
router.post("/top-up/:userId", topUp);

// paymentMethod
router.get("/get-payment-methods", getAllPaymentMethods);
router.post("/create-payment-method", createPaymentMethod);

// paymentDetail
router.post("/api/payment", processPayment); 

export default router;
