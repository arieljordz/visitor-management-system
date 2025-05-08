import React from "react";
import { Routes, Route } from "react-router-dom";

// Client pages
import Dashboard from "../pages/Dashboard/Dashboard";
import PaymentHistory from "../pages/Transactions/PaymentHistory";
import GeneratedQRCodes from "../pages/Transactions/GeneratedQRCodes";
import MyWallet from "../pages/MyWallet/MyWallet";

// Admin pages
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminPaymentHistory from "../pages/AdminTransactions/AdminPaymentHistory";
import AdminGeneratedQRCodes from "../pages/AdminTransactions/AdminGeneratedQRCodes";
import Verifications from "../pages/Verifications/Verifications";
import FMProofs from "../pages/FileMaintenance/FMProofs";
import FMPaymentMethod from "../pages/FileMaintenance/FMPaymentMethod";
import FMPaymentAccount from "../pages/FileMaintenance/FMPaymentAccount";
import FMClassification from "../pages/FileMaintenance/FMClassification";
import FMFees from "../pages/FileMaintenance/FMFees";
import FMAccounts from "../pages/FileMaintenance/FMAccounts";
import GenerateReports from "../pages/Reports/GenerateReports";
import Settings from "../pages/Settings/Settings";

// Staff page
import ScanQR from "../pages/ScanQR/ScanQR";
import Subscriptions from "../pages/Subscriptions/Subscriptions";

const MainRoutes = ({ user }) => (
  <Routes>
    {/* Client */}
    <Route path="/dashboard" element={<Dashboard user={user}/>} />
    <Route path="/transactions/payment-history" element={<PaymentHistory user={user}/>} />
    <Route path="/transactions/generated-qr-codes" element={<GeneratedQRCodes user={user}/>} />
    <Route path="/my-wallet" element={<MyWallet user={user}/>} />

    {/* Admin */}
    <Route path="/admin/dashboard" element={<AdminDashboard user={user}/>} />
    <Route path="/admin/transactions/payment-history" element={<AdminPaymentHistory user={user}/>} />
    <Route path="/admin/transactions/generated-qr-codes" element={<AdminGeneratedQRCodes user={user}/>} />
    <Route path="/admin/verifications" element={<Verifications user={user}/>} />
    <Route path="/admin/file-maintenance/proofs" element={<FMProofs user={user}/>} />
    <Route path="/admin/file-maintenance/payment-methods" element={<FMPaymentMethod user={user}/>} />
    <Route path="/admin/file-maintenance/payment-accounts" element={<FMPaymentAccount user={user}/>} />
    <Route path="/admin/file-maintenance/classifications" element={<FMClassification user={user}/>} />
    <Route path="/admin/file-maintenance/fees" element={<FMFees user={user}/>} />
    <Route path="/admin/file-maintenance/accounts" element={<FMAccounts user={user}/>} />
    <Route path="/admin/subscriptions" element={<Subscriptions user={user}/>} />
    <Route path="/admin/generate-reports" element={<GenerateReports user={user}/>} />
    <Route path="/admin/settings" element={<Settings user={user}/>} />

    {/* Staff */}
    <Route path="/staff/scan-qr" element={<ScanQR user={user}/>} />
  </Routes>
);

export default MainRoutes;
