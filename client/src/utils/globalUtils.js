import moment from "moment-timezone";

export const formatDate = (dateStr) => {
  if (!dateStr) return "";

  return moment.tz(dateStr, "Asia/Manila").format("MM-DD-YYYY");
  // e.g., "05-18-2025"
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "";

  return moment.tz(dateStr, "Asia/Manila").format("MM-DD-YYYY hh:mm A");
  // e.g., "05-18-2025 08:30 AM"
};

export const formatShortDate = (date) => {
  if (!date) return "—";

  return moment.tz(date, "Asia/Manila").format("MMM D, YYYY");
  // e.g., "May 18, 2025"
};

export const formatShortDateTime = (date) => {
  if (!date) return "—";

  return moment.tz(date, "Asia/Manila").format("MMM D, YYYY hh:mm A");
  // e.g., "May 18, 2025 08:30 AM"
};

export const SystemSettings = ({ title, favicon }) => {
  // Set title
  if (title) {
    document.title = title;
  }

  // Set favicon
  if (favicon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }
};
