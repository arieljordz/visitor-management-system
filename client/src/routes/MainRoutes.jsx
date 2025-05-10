import { Routes, Route } from "react-router-dom";

// Subscriber pages
import Dashboard from "../pages/Dashboard/Dashboard";
import PaymentHistory from "../pages/Transactions/PaymentHistory";
import GeneratedQRCodes from "../pages/Transactions/GeneratedQRCodes";
import MyWallet from "../pages/MyWallet/MyWallet";

// Admin pages
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

const MainRoutes = () => (
  <Routes>
    {/* Subscriber */}
    <Route path="/dashboard" element={<Dashboard/>} />
    <Route path="/payment-history" element={<PaymentHistory/>} />
    <Route path="/generated-qr-codes" element={<GeneratedQRCodes/>} />
    <Route path="/my-wallet" element={<MyWallet/>} />

    {/* Admin */}
    <Route path="/verifications" element={<Verifications/>} />
    <Route path="/file-maintenance/proofs" element={<FMProofs/>} />
    <Route path="/file-maintenance/payment-methods" element={<FMPaymentMethod/>} />
    <Route path="/file-maintenance/payment-accounts" element={<FMPaymentAccount/>} />
    <Route path="/file-maintenance/classifications" element={<FMClassification/>} />
    <Route path="/file-maintenance/fees" element={<FMFees/>} />
    <Route path="/file-maintenance/accounts" element={<FMAccounts/>} />
    <Route path="/subscriptions" element={<Subscriptions/>} />
    <Route path="/generate-reports" element={<GenerateReports/>} />
    <Route path="/settings" element={<Settings/>} />

    {/* Staff */}
    <Route path="/scan-qr" element={<ScanQR/>} />
  </Routes>
);

export default MainRoutes;
