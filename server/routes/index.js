import express from "express";
import {
  register,
  login,
  googleLogin,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";
import {
  generateQRCode,
  scanQRCode,
  getGeneratedQRCodes,
  getGeneratedQRCodesById,
} from "../controllers/qrController.js";
import { getBalance, topUp } from "../controllers/balanceController.js";
import {
  createPaymentMethod,
  getPaymentMethods,
  getPaymentMethodById,
  deletePaymentMethod,
  updatePaymentMethod,
} from "../controllers/paymentMethodController.js";
import {
  processPayment,
  getPaymentDetails,
  getPaymentDetailsById,
  getPaymentProofs,
  deletePaymentProofs,
  updateVerificationStatus,
} from "../controllers/paymentDetailController.js";
import {
  addClassification,
  getClassifications,
  getClassificationById,
  deleteClassification,
  updateClassification,
} from "../controllers/classificationController.js";
import {
  createVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorByUserId,
  deleteVisitorById,
  updateVisitorById,
} from "../controllers/visitorController.js";
import {
  createFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
} from "../controllers/feeController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// user
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

router.post("/create-user", createUser);
router.get("/get-users", getUsers);
router.get("/get-user/:id", getUserById);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);
router.post("/login", loginUser);

// QRCode
router.post("/generate-qr/:userId", generateQRCode);
router.post("/scan", scanQRCode);
router.get("/get-generated-qr", getGeneratedQRCodes);
router.get("/get-generated-qr/:userId", getGeneratedQRCodesById);

// balance
router.get("/check-balance/:userId", getBalance);
router.post("/top-up/:userId", upload.single("proof"), topUp);

// paymentMethod
router.post("/create-payment-method", createPaymentMethod);
router.get("/get-payment-methods", getPaymentMethods);
router.get("/get-payment-method/:id", getPaymentMethodById);
router.delete("/delete-payment-method/:id", deletePaymentMethod);
router.put("/update-payment-method/:id", updatePaymentMethod);

// paymentDetail
router.post("/submit-payment", processPayment);
router.get("/get-payment-details", getPaymentDetails);
router.get("/get-payment-details/:userId", getPaymentDetailsById);
router.get("/get-payment-proofs", getPaymentProofs);
router.delete("/delete-payment-proofs", deletePaymentProofs); 
router.put("/update-verification/:id", updateVerificationStatus);

// classification
router.post("/create-classification", addClassification);
router.get("/get-classifications", getClassifications);
router.get("/get-classification/:id", getClassificationById);
router.delete("/delete-classification/:id", deleteClassification);
router.put("/update-classification/:id", updateClassification);

// visitor
router.post("/create-visitor", createVisitor);
router.get("/get-visitors", getAllVisitors);
router.get("/get-visitor/:id", getVisitorById);
router.get("/get-visitor-by-user/:userId", getVisitorByUserId);
router.delete("/delete-visitor/:id", deleteVisitorById);
router.put("/update-visitor/:id", updateVisitorById);

// fee
router.post("/create-fee", createFee);
router.get("/get-fees", getFees);
router.get("/get-fee/:id", getFeeById);
router.put("/update-fee/:id", updateFee);
router.delete("/delete-fee/:id", deleteFee);

export default router;
