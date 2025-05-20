export const UserRoleEnum = Object.freeze({
  ADMIN: "admin",
  SUBSCRIBER: "subscriber",
  STAFF: "staff",
});

export const StatusEnum = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

export const PaymentStatusEnum = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

export const QRStatusEnum = Object.freeze({
  PENDING: "pending",
  ACTIVE: "active",
  SCANNED: "scanned",
  USED: "used",
  EXPIRED: "expired",
  REVOKED: "revoked",
});

export const VisitorTypeEnum = Object.freeze({
  INDIVIDUAL: "Individual",
  GROUP: "Group",
});

export const PaymentMethodEnum = Object.freeze({
  BANK: "Bank",
  GCASH: "GCash",
  PAYMAYA: "PayMaya",
  PAYPAL: "Paypal",
  E_WALLET: "e-wallet",
});

export const VerificationStatusEnum = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  DECLINED: "declined",
});

export const TransactionEnum = Object.freeze({
  DEBIT: "debit",
  CREDIT: "credit",
});

export const NotificationEnum = Object.freeze({
  TOP_UP: "top-up",
  PAYMENT: "payment",
  SUBSCRIPTION: "subscription",
});

export const MenuEnum = Object.freeze({
  DASHBOARD: "Dashboard",
  GENERATED_QR: "Generated QR Codes",
  PAYMENT_HISTORY: "Payment History",
  SUBSCRIPTIONS: "Subscriptions",
  VERIFICATIONS: "Verifications",
  REPORTS: "Reports",
  FILE_MAINTENANCE: "File Maintenance",
  SETTINGS: "Settings",
  LOGOUT: "Logout",
});

export const SubMenuEnum = Object.freeze({
  PAYMENT_METHODS: "Payment Methods",
  PAYMENT_ACCOUNTS: "Payment Accounts",
  DEPARTMENTS: "Departments",
  CLASSIFICATIONS: "Classifications",
  FEES: "Fees",
  ACCOUNTS: "Accounts",
});

export const FeeCodeEnum = Object.freeze({
  GENQR01: "GENQR01",
  PREM01: "PREM01",
  PREM02: "PREM02",
  PREM03: "PREM03",
});

export const ValidityEnum = Object.freeze({
  NO_EXPIRATION: "No Expiration",
  VALID_TODAY: "Valid Today",
});

export const PasswordEnum = Object.freeze({
  DEFAULT_PASS: "DefaultPass123!",
});
