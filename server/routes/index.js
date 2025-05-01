import express from "express";
import {
  login,
  googleLogin,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  generateQRCode,
  generateQRCodeWithPayment,
  scanQRCode,
  getGeneratedQRCodes,
  getGeneratedQRCodesById,
  checkActiveQRCodeById,
} from "../controllers/qrController.js";
import { getBalance, topUp } from "../controllers/balanceController.js";
import {
  processPayment,
  getPaymentDetails,
  getPaymentDetailsById,
  getPaymentProofs,
  deletePaymentProofs,
  updateVerificationStatus,
  verifyPayment,
  declinePayment,
} from "../controllers/paymentDetailController.js";
import {
  createPaymentMethod,
  getPaymentMethods,
  getActivePaymentMethods,
  getPaymentMethodById,
  deletePaymentMethod,
  updatePaymentMethod,
} from "../controllers/paymentMethodController.js";
import { createPaymentAccount, 
  deletePaymentAccount,
  getPaymentAccountById, 
  getPaymentAccounts, 
  updatePaymentAccount,
  getActivePaymentAccounts,
} from "../controllers/paymentAccountController.js";
import {
  createClassification,
  getClassifications,
  getClassificationById,
  deleteClassification,
  updateClassification,
} from "../controllers/classificationController.js";
import {
  getAllVisitors,
  getVisitorById,
  getVisitorByUserId,
  deleteVisitorById,
  updateVisitorById,
  searchVisitor,
  getVisitorNames,
  createVisitorDetail,
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
import {
  getDashboardStats,
} from "../controllers/dashboardController.js";
import {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
} from "../controllers/auditLogController.js";
import upload from "../middlewares/uploadMiddleware.js";
import authenticate from "../middlewares/authMiddleware.js";
import auditMiddleware from "../middlewares/auditMiddleware.js";

const router = express.Router();

// User Routes
router.post("/login-user", auditMiddleware("LOGIN_USER"), login);
router.post("/google-login-user", auditMiddleware("GOOGLE_LOGIN_USER"), googleLogin);
router.post("/refresh-token", authenticate, refreshToken);
router.get("/google-login-verify-user", auditMiddleware("GOOGLE_VERIFIY_USER"), verifyEmail);
router.post("/forgot-password", auditMiddleware("FORGOT_PASSWORD_USER"), forgotPassword);
router.post("/reset-password/:token", auditMiddleware("RESET_PASSWORD_USER"), resetPassword);
router.put("/logout-user", authenticate, auditMiddleware("LOGOUT_USER"), logout);
router.post("/create-user", auditMiddleware("REGISTER_USER"), createUser);
router.get("/get-users", authenticate, getUsers);
router.get("/get-user/:id", authenticate, getUserById);
router.put("/update-user/:id", authenticate, auditMiddleware("UPDATE_USER"), updateUser);
router.delete("/delete-user/:id", authenticate, auditMiddleware("DELETE_USER"), deleteUser);

// QRCode Routes
router.post("/generate-qr", authenticate, auditMiddleware("GENERATE_QR_CODE"), generateQRCodeWithPayment);
router.post("/generate-qr/:userId/:visitorId", authenticate, auditMiddleware("GENERATE_QR_CODE"), generateQRCode);
router.get("/scan-qr/:qrData", authenticate, auditMiddleware("SCAN_QR_CODE"), scanQRCode);
router.get("/get-generated-qr", authenticate, getGeneratedQRCodes);
router.get("/get-generated-qr/:userId", authenticate, getGeneratedQRCodesById);
router.get("/check-active-qr/:userId/:visitorId", authenticate, checkActiveQRCodeById);

// Balance Routes
router.get("/check-balance/:userId", authenticate, getBalance);
router.post("/top-up/:userId", authenticate, auditMiddleware("TOPUP_BALANCE"), upload.single("proof"), topUp);

// PaymentDetail Routes
router.post("/submit-payment", authenticate, auditMiddleware("SUBMIT_PAYMENT"), processPayment);
router.get("/get-payment-details", authenticate, getPaymentDetails);
router.get("/get-payment-details/:userId", authenticate, getPaymentDetailsById);
router.get("/get-payment-proofs", authenticate, getPaymentProofs);
router.delete("/delete-payment-proofs", authenticate, auditMiddleware("DELETE_PAYMENT"), deletePaymentProofs);
router.put("/update-verification/:id", authenticate, auditMiddleware("UPDATE_PAYMENT"), updateVerificationStatus);
router.put("/payment-verification-verify/:id", authenticate, auditMiddleware("VERIFY_PAYMENT"), verifyPayment);
router.put("/payment-verification-decline/:id", authenticate, auditMiddleware("DECLINE_PAYMENT"), declinePayment);

// PaymentMethod Routes
router.post("/create-payment-method", authenticate, auditMiddleware("CREATE_PAYMENT_METHOD"), createPaymentMethod);
router.get("/get-payment-methods", authenticate, getPaymentMethods);
router.get("/get-active-payment-methods", authenticate, getActivePaymentMethods);
router.get("/get-payment-method/:id", authenticate, getPaymentMethodById);
router.delete("/delete-payment-method/:id", authenticate, auditMiddleware("DELETE_PAYMENT_METHOD"), deletePaymentMethod);
router.put("/update-payment-method/:id", authenticate, auditMiddleware("UPDATE_PAYMENT_METHOD"), updatePaymentMethod);

// PaymentAccount Routes
router.post("/create-payment-account", authenticate, auditMiddleware("CREATE_PAYMENT_ACCOUNT"), createPaymentAccount);
router.get("/get-payment-accounts", authenticate, getPaymentAccounts);
router.get("/get-active-payment-accounts", authenticate, getActivePaymentAccounts);
router.get("/get-payment-account/:id", authenticate, getPaymentAccountById);
router.delete("/delete-payment-account/:id", authenticate, auditMiddleware("DELETE_PAYMENT_ACCOUNT"), deletePaymentAccount);
router.put("/update-payment-account/:id", authenticate, auditMiddleware("UPDATE_PAYMENT_ACCOUNT"), updatePaymentAccount);

// Classification Routes
router.post("/create-classification", authenticate, auditMiddleware("CREATE_CLASSIFICATION"), createClassification);
router.get("/get-classifications", authenticate, getClassifications);
router.get("/get-classification/:id", authenticate, getClassificationById);
router.delete("/delete-classification/:id", authenticate, auditMiddleware("DELETE_CLASSIFICATION"), deleteClassification);
router.put("/update-classification/:id", authenticate, auditMiddleware("UPDATE_CLASSIFICATION"), updateClassification);

// Visitor Routes
router.get("/get-visitors", authenticate, getAllVisitors);
router.get("/get-visitor/:id", authenticate, getVisitorById);
router.get("/get-visitor-by-user/:userId", authenticate, getVisitorByUserId);
router.delete("/delete-visitor/:id", authenticate, auditMiddleware("DELETE_VISITOR"), deleteVisitorById);
router.put("/update-visitor/:id", authenticate, auditMiddleware("UPDATE_VISITOR"), updateVisitorById);

router.get("/search-visitor", authenticate, searchVisitor);
router.get("/visitors-names", authenticate, getVisitorNames);
router.post("/create-visitors-detail", authenticate, auditMiddleware("CREATE_VISITOR_DETAIL"), createVisitorDetail);

// Fee Routes
router.post("/create-fee", authenticate, auditMiddleware("CREATE_FEE"), createFee);
router.get("/get-fees", authenticate, getFees);
router.get("/get-fee/:id", authenticate, getFeeById);
router.put("/update-fee/:id", authenticate, auditMiddleware("UPDATE_FEE"), updateFee);
router.delete("/delete-fee/:id", authenticate, auditMiddleware("DELETE_FEE"), deleteFee);

// Notification Routes
router.post("/create-notification", authenticate, createNotification);
router.get("/get-notifications", authenticate, getNotifications);
router.get("/get-notifications/:userId", authenticate, getNotificationsById);
router.put("/mark-as-read", authenticate, markAsRead);
router.put("/mark-as-read/:userId", authenticate, markAsReadById);

// Dashboard Routes
router.get("/get-dashboard-stats", authenticate, getDashboardStats);

// AuditLog Routes
router.post("/create-auditlog", authenticate, createAuditLog);
router.get("/get-auditlogs", authenticate, getAuditLogs);
router.get("/get-auditlog/:id", authenticate, getAuditLogById);

export default router;
