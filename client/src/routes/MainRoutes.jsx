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

// Staff page
import ScanQR from "../pages/ScanQR/ScanQR";

const MainRoutes = ({ user, setUser }) => (
  <Routes>
    {/* Client */}
    <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
    <Route path="/transactions/payment-history" element={<PaymentHistory user={user} setUser={setUser} />} />
    <Route path="/transactions/generated-qr-codes" element={<GeneratedQRCodes user={user} setUser={setUser} />} />
    <Route path="/my-wallet" element={<MyWallet user={user} setUser={setUser} />} />

    {/* Admin */}
    <Route path="/admin/dashboard" element={<AdminDashboard user={user} setUser={setUser} />} />
    <Route path="/admin/transactions/payment-history" element={<AdminPaymentHistory user={user} setUser={setUser} />} />
    <Route path="/admin/transactions/generated-qr-codes" element={<AdminGeneratedQRCodes user={user} setUser={setUser} />} />
    <Route path="/admin/verifications" element={<Verifications user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/proofs" element={<FMProofs user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/payment-methods" element={<FMPaymentMethod user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/payment-accounts" element={<FMPaymentAccount user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/classifications" element={<FMClassification user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/fees" element={<FMFees user={user} setUser={setUser} />} />
    <Route path="/admin/file-maintenance/accounts" element={<FMAccounts user={user} setUser={setUser} />} />

    {/* Staff */}
    <Route path="/staff/scan-qr" element={<ScanQR user={user} setUser={setUser} />} />
  </Routes>
);

export default MainRoutes;
