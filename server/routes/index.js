import express from "express";
import { register, login, googleLogin } from "../controllers/userController.js";
import { generateQRCode } from "../controllers/qrController.js";
import { getBalance, topUp } from "../controllers/balanceController.js";
import {
  getAllPaymentMethods,
  createPaymentMethod,
} from "../controllers/paymentMethodController.js";
import { processPayment } from "../controllers/paymentDetailController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// user
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// generate QR
router.post("/generate-qr/:userId", generateQRCode);

// balance
router.get("/check-balance/:userId", getBalance);
router.post("/top-up/:userId", upload.single("proof"), topUp);

// paymentMethod
router.get("/get-payment-methods", getAllPaymentMethods);
router.post("/create-payment-method", createPaymentMethod);

// paymentDetail
router.post("/submit-payment", processPayment);

export default router;
