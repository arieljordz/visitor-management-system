import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Visitors from "../pages/Visitors/Visitors";
import PaymentHistory from "../pages/Transactions/PaymentHistory";
import GeneratedQRCodes from "../pages/Transactions/GeneratedQRCodes";
import MyWallet from "../pages/MyWallet/MyWallet";
import Subscriptions from "../pages/Subscriptions/Subscriptions";
import Verifications from "../pages/Verifications/Verifications";
import FMProofs from "../pages/FileMaintenance/FMProofs";
import FMPaymentMethod from "../pages/FileMaintenance/FMPaymentMethod";
import FMPaymentAccount from "../pages/FileMaintenance/FMPaymentAccount";
import FMClassification from "../pages/FileMaintenance/FMClassification";
import FMFees from "../pages/FileMaintenance/FMFees";
import FMAccounts from "../pages/FileMaintenance/FMAccounts";
import GenerateReports from "../pages/Reports/GenerateReports";
import Subscribe from "../pages/Subscriptions/Subscribe";
import Settings from "../pages/Settings/Settings";
import ScanQR from "../pages/ScanQR/ScanQR";


const MainRoutes = () => (
  <Routes>
    {/* Subscriber */}
    <Route path="/dashboard" element={<Dashboard/>} />
    <Route path="/visitors" element={<Visitors/>} />
    <Route path="/payment-history" element={<PaymentHistory/>} />
    <Route path="/generated-qr-codes" element={<GeneratedQRCodes/>} />
    <Route path="/my-wallet" element={<MyWallet/>} />
    <Route path="/subscriptions" element={<Subscriptions/>} />
    <Route path="/verifications" element={<Verifications/>} />
    <Route path="/file-maintenance/proofs" element={<FMProofs/>} />
    <Route path="/file-maintenance/payment-methods" element={<FMPaymentMethod/>} />
    <Route path="/file-maintenance/payment-accounts" element={<FMPaymentAccount/>} />
    <Route path="/file-maintenance/classifications" element={<FMClassification/>} />
    <Route path="/file-maintenance/fees" element={<FMFees/>} />
    <Route path="/file-maintenance/accounts" element={<FMAccounts/>} />
    <Route path="/generate-reports" element={<GenerateReports/>} />
    <Route path="/subscribe" element={<Subscribe/>} />
    <Route path="/settings" element={<Settings/>} />
    <Route path="/scan-qr" element={<ScanQR/>} />
  </Routes>
);

export default MainRoutes;
