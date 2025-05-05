const menuConfig = {
    client: [
      {
        label: "Dashboard",
        icon: "fas fa-home",
        path: "/dashboard",
      },
      {
        label: "Transactions",
        icon: "fas fa-money-check-alt",
        submenu: [
          { label: "Payment History", path: "/transactions/payment-history" },
          { label: "Generated QR Codes", path: "/transactions/generated-qr-codes" },
        ],
      },
      {
        label: "My Wallet",
        icon: "fas fa-wallet",
        path: "/my-wallet",
      },
      {
        label: "Logout",
        icon: "fas fa-sign-out-alt",
        path: "/",
      },
    ],
  
    admin: [
      {
        label: "Dashboard",
        icon: "fas fa-home",
        path: "/admin/dashboard",
      },
      {
        label: "Transactions",
        icon: "fas fa-money-check-alt",
        submenu: [
          { label: "Payment History", path: "/admin/transactions/payment-history" },
          { label: "Generated QR Codes", path: "/admin/transactions/generated-qr-codes" },
        ],
      },
      {
        label: "Verifications",
        icon: "fas fa-check-circle",
        path: "/admin/verifications",
      },
      {
        label: "File Maintenance",
        icon: "fas fa-folder",
        submenu: [
          { label: "Proofs", path: "/admin/file-maintenance/proofs" },
          { label: "Payment Methods", path: "/admin/file-maintenance/payment-methods" },
          { label: "Classifications", path: "/admin/file-maintenance/classifications" },
          { label: "Fees", path: "/admin/file-maintenance/fees" },
          { label: "Accounts", path: "/admin/file-maintenance/accounts" },
        ],
      },
      {
        label: "Settings",
        icon: "fas fa-cog",
        path: "/admin/settings",
      },
      {
        label: "Logout",
        icon: "fas fa-sign-out-alt",
        path: "/",
      },
    ],
  
    staff: [
      {
        label: "Scan QR Code",
        icon: "fas fa-qrcode",
        path: "/staff/scan-qr",
      },
      {
        label: "Logout",
        icon: "fas fa-sign-out-alt",
        path: "/",
      },
    ],
  };
  
  export default menuConfig;
  