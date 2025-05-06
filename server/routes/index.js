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
  generateQRCodeWithPayment,
  generateQRCodeSubscription,
  scanQRCode,
  getGeneratedQRCodes,
  getGeneratedQRCodesById,
  checkActiveQRCodeForVisit,
} from "../controllers/qrController.js";
import { getBalance, topUp } from "../controllers/balanceController.js";
import {
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
  getFeeByCodeAndStatus,
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
import {
  getVisitorsByDateRange,
  getPaymentDetailsByDateRange,
  getAuditLogsByDateRange,
} from "../controllers/reportController.js";
import { 
  createMenuConfig,
  getMenuByRole,
  upsertMenuConfig
} from "../controllers/menuConfigController.js";
import {
  getFeatureFlags,
  updateFeatureFlag,
} from "../controllers/featureFlagController.js";
import upload from "../middlewares/uploadMiddleware.js";
import authenticate from "../middlewares/authMiddleware.js";
import auditLogger from "../middlewares/auditMiddleware.js";
import checkFeature from "../middlewares/routesMiddleware.js";

const router = express.Router();

// User Routes
router.post("/login-user", auditLogger("LOGIN_USER"), login);
router.post("/google-login-user", auditLogger("GOOGLE_LOGIN_USER"), googleLogin);
router.post("/refresh-token", authenticate, refreshToken);
router.get("/google-login-verify-user", auditLogger("GOOGLE_VERIFIY_USER"), verifyEmail);
router.post("/forgot-password", auditLogger("FORGOT_PASSWORD_USER"), forgotPassword);
router.post("/reset-password/:token", auditLogger("RESET_PASSWORD_USER"), resetPassword);
router.put("/logout-user", authenticate, auditLogger("LOGOUT_USER"), logout);
router.post("/create-user", auditLogger("REGISTER_USER"), createUser);
router.get("/get-users", authenticate, getUsers);
router.get("/get-user/:id", authenticate, getUserById);
router.put("/update-user/:id", authenticate, auditLogger("UPDATE_USER"), updateUser);
router.delete("/delete-user/:id", authenticate, auditLogger("DELETE_USER"), deleteUser);

// QRCode Routes
router.post("/generate-qr", authenticate, auditLogger("GENERATE_QR_CODE"), generateQRCodeWithPayment);
router.post("/generate-qr-subscription", authenticate, auditLogger("GENERATE_QR_CODE"), generateQRCodeSubscription);
router.get("/scan-qr/:qrData", authenticate, auditLogger("SCAN_QR_CODE"), scanQRCode);
router.get("/get-generated-qr", authenticate, getGeneratedQRCodes);
router.get("/get-generated-qr/:userId", authenticate, getGeneratedQRCodesById);
router.get("/check-active-qr/:userId/:visitorId/:visitdetailsId", authenticate, checkActiveQRCodeForVisit);

// Balance Routes
router.get("/check-balance/:userId", authenticate, getBalance);
router.post("/top-up/:userId", authenticate, auditLogger("TOPUP_BALANCE"), upload.single("proof"), topUp);

// PaymentDetail Routes
router.get("/get-payment-details", authenticate, checkFeature("disableSubscription"), getPaymentDetails);
router.get("/get-payment-details/:userId", authenticate, checkFeature("disableSubscription"), getPaymentDetailsById);
router.get("/get-payment-proofs", authenticate, checkFeature("disableSubscription"), getPaymentProofs);
router.delete("/delete-payment-proofs", authenticate, auditLogger("DELETE_PAYMENT"), deletePaymentProofs);
router.put("/update-verification/:id", authenticate, auditLogger("UPDATE_PAYMENT"), updateVerificationStatus);
router.put("/payment-verification-verify/:id", authenticate, auditLogger("VERIFY_PAYMENT"), verifyPayment);
router.put("/payment-verification-decline/:id", authenticate, auditLogger("DECLINE_PAYMENT"), declinePayment);

// PaymentMethod Routes
router.post("/create-payment-method", authenticate, auditLogger("CREATE_PAYMENT_METHOD"), createPaymentMethod);
router.get("/get-payment-methods", authenticate, getPaymentMethods);
router.get("/get-active-payment-methods", authenticate, getActivePaymentMethods);
router.get("/get-payment-method/:id", authenticate, getPaymentMethodById);
router.delete("/delete-payment-method/:id", authenticate, auditLogger("DELETE_PAYMENT_METHOD"), deletePaymentMethod);
router.put("/update-payment-method/:id", authenticate, auditLogger("UPDATE_PAYMENT_METHOD"), updatePaymentMethod);

// PaymentAccount Routes
router.post("/create-payment-account", authenticate, auditLogger("CREATE_PAYMENT_ACCOUNT"), createPaymentAccount);
router.get("/get-payment-accounts", authenticate, getPaymentAccounts);
router.get("/get-active-payment-accounts", authenticate, getActivePaymentAccounts);
router.get("/get-payment-account/:id", authenticate, getPaymentAccountById);
router.delete("/delete-payment-account/:id", authenticate, auditLogger("DELETE_PAYMENT_ACCOUNT"), deletePaymentAccount);
router.put("/update-payment-account/:id", authenticate, auditLogger("UPDATE_PAYMENT_ACCOUNT"), updatePaymentAccount);

// Classification Routes
router.post("/create-classification", authenticate, auditLogger("CREATE_CLASSIFICATION"), createClassification);
router.get("/get-classifications", authenticate, getClassifications);
router.get("/get-classification/:id", authenticate, getClassificationById);
router.delete("/delete-classification/:id", authenticate, auditLogger("DELETE_CLASSIFICATION"), deleteClassification);
router.put("/update-classification/:id", authenticate, auditLogger("UPDATE_CLASSIFICATION"), updateClassification);

// Visitor Routes
router.get("/get-visitors", authenticate, getAllVisitors);
router.get("/get-visitor/:id", authenticate, getVisitorById);
router.get("/get-visitor-by-user/:userId", authenticate, getVisitorByUserId);
router.delete("/delete-visitor/:id", authenticate, auditLogger("DELETE_VISITOR"), deleteVisitorById);
router.put("/update-visitor/:id", authenticate, auditLogger("UPDATE_VISITOR"), updateVisitorById);

router.get("/search-visitor", authenticate, searchVisitor);
router.get("/visitors-names", authenticate, getVisitorNames);
router.post("/create-visitors-detail", authenticate, auditLogger("CREATE_VISITOR_DETAIL"), createVisitorDetail);

// Fee Routes
router.post("/create-fee", authenticate, auditLogger("CREATE_FEE"), createFee);
router.get("/get-fees", authenticate, getFees);
router.get("/get-fee/:id", authenticate, getFeeById);
router.put("/update-fee/:id", authenticate, auditLogger("UPDATE_FEE"), updateFee);
router.delete("/delete-fee/:id", authenticate, auditLogger("DELETE_FEE"), deleteFee);
router.get("/get-fee-code/:feeCode", authenticate, getFeeByCodeAndStatus);

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

// Report Routes
router.get("/get-visitors-report", getVisitorsByDateRange);
router.get("/get-payment-details-report", getPaymentDetailsByDateRange);
router.get("/get-auditlogs-report", getAuditLogsByDateRange);

// MenuConfig Routes
router.post("/create-menu-config", createMenuConfig); 
router.get("/get-menu-config/:role", getMenuByRole);
router.post("/upsert-menu-config", upsertMenuConfig);

// Feature Flag Routes
router.get("/get-feature-flags", authenticate, getFeatureFlags);
router.put("/update-feature-flags/:key", authenticate, updateFeatureFlag); 

export default router;
