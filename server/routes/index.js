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
} from "../controllers/userController.js";
import {
  generateQRCode,
  scanQRCode,
  getGeneratedQRCodes,
  getGeneratedQRCodesById,
  checkActiveQRCodeById,
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
import {
  createNotification,
  getNotifications,
  getNotificationsById,
  markAsRead,
  markAsReadById,
} from "../controllers/notificationController.js";
import upload from "../middlewares/uploadMiddleware.js";
import authenticate from "../middlewares/authMiddleware.js";

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

// QRCode Routes
router.post("/generate-qr/:userId/:visitorId", authenticate, generateQRCode);
router.post("/scan", authenticate, scanQRCode);
router.get("/get-generated-qr", authenticate, getGeneratedQRCodes);
router.get("/get-generated-qr/:userId", authenticate, getGeneratedQRCodesById);
router.get(
  "/check-active-qr/:userId/:visitorId",
  authenticate,
  checkActiveQRCodeById
);

// Balance Routes
router.get("/check-balance/:userId", authenticate, getBalance);
router.post("/top-up/:userId", authenticate, upload.single("proof"), topUp);

// PaymentMethod Routes
router.post("/create-payment-method", authenticate, createPaymentMethod);
router.get("/get-payment-methods", authenticate, getPaymentMethods);
router.get("/get-payment-method/:id", authenticate, getPaymentMethodById);
router.delete("/delete-payment-method/:id", authenticate, deletePaymentMethod);
router.put("/update-payment-method/:id", authenticate, updatePaymentMethod);

// PaymentDetail Routes
router.post("/submit-payment", authenticate, processPayment);
router.get("/get-payment-details", authenticate, getPaymentDetails);
router.get("/get-payment-details/:userId", authenticate, getPaymentDetailsById);
router.get("/get-payment-proofs", authenticate, getPaymentProofs);
router.delete("/delete-payment-proofs", authenticate, deletePaymentProofs);
router.put("/update-verification/:id", authenticate, updateVerificationStatus);

// Classification Routes
router.post("/create-classification", authenticate, addClassification);
router.get("/get-classifications", authenticate, getClassifications);
router.get("/get-classification/:id", authenticate, getClassificationById);
router.delete("/delete-classification/:id", authenticate, deleteClassification);
router.put("/update-classification/:id", authenticate, updateClassification);

// Visitor Routes
router.post("/create-visitor", authenticate, createVisitor);
router.get("/get-visitors", authenticate, getAllVisitors);
router.get("/get-visitor/:id", authenticate, getVisitorById);
router.get("/get-visitor-by-user/:userId", authenticate, getVisitorByUserId);
router.delete("/delete-visitor/:id", authenticate, deleteVisitorById);
router.put("/update-visitor/:id", authenticate, updateVisitorById);

// Fee Routes
router.post("/create-fee", authenticate, createFee);
router.get("/get-fees", authenticate, getFees);
router.get("/get-fee/:id", authenticate, getFeeById);
router.put("/update-fee/:id", authenticate, updateFee);
router.delete("/delete-fee/:id", authenticate, deleteFee);

// Notification Routes
router.post("/create-notification", authenticate, createNotification);
router.get("/get-notifications", authenticate, getNotifications);
router.get("/get-notifications/:userId", authenticate, getNotificationsById);
router.put("/mark-as-read", authenticate, markAsRead);
router.put("/mark-as-read/:userId", authenticate, markAsReadById);

export default router;
