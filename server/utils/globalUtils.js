import moment from "moment-timezone";

export function convertDateRangeToUTC(dateFrom, dateTo, timezone = "Asia/Manila") {
  const startDate = moment.tz(dateFrom, timezone).startOf("day").toDate();
  const endDate = moment.tz(dateTo, timezone).endOf("day").toDate();
  return { startDate, endDate };
};
