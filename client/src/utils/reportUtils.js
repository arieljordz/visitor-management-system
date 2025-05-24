// utils/reportUtils.js
import {
  getVisitorsByDateRange,
  getPaymentDetailsByDateRange,
  getAuditLogsByDateRange,
} from "../services/reportService";
import { formatDate, formatDateTime, toProperCase } from "./globalUtils";
import { VisitorTypeEnum } from "../enums/enums";

export const generateReportData = async (
  reportType,
  dateFrom,
  dateTo,
  department = "",
  subscriberId
) => {
  let rows = [];
  let columns = [];
  let title = "";

  switch (reportType) {
    case "visitor": {
      const visitors = await getVisitorsByDateRange({
        dateFrom,
        dateTo,
        department,
        subscriberId,
      });

      columns = [
        { header: "#", key: "id", width: "10%" },
        { header: "Name", key: "name" },
        { header: "Visitor Type", key: "visitorType" },
        { header: "Purpose", key: "purpose" },
        { header: "Department", key: "department" },
        { header: "Classification", key: "classification" },
        { header: "No. of Visitors", key: "noOfVisitors" },
        { header: "Visit Date", key: "visitDate" },
        { header: "Scan Date", key: "scanTime" },
      ];

      rows = visitors.map((item, index) => {
        const visitor = item.visitDetail.visitorId;
        const visit = item.visitDetail;

        const name =
          visitor?.visitorType === VisitorTypeEnum.INDIVIDUAL
            ? `${toProperCase(visitor?.firstName)} ${toProperCase(
                visitor?.lastName
              )}`
            : toProperCase(visitor?.groupName);

        const latestScan = item.scanLogs?.length
          ? item.scanLogs[item.scanLogs.length - 1]
          : null;

        return {
          id: index + 1,
          name,
          visitorType: toProperCase(visitor?.visitorType),
          purpose: toProperCase(visit.purpose),
          department: toProperCase(visit.department),
          classification: toProperCase(visit.classification),
          noOfVisitors: visit.noOfVisitors || 1,
          visitDate: formatDateTime(visit.visitDate),
          scanTime: latestScan ? formatDateTime(latestScan.scannedAt) : "N/A",
        };
      });

      title = `Visitor Report - ${formatDate(
        new Date(dateFrom)
      )} to ${formatDate(new Date(dateTo))}${
        department ? ` | Department: ${department}` : ""
      }`;
      break;
    }

    case "payment": {
      const payments = await getPaymentDetailsByDateRange({ dateFrom, dateTo });

      columns = [
        { header: "#", key: "id" },
        { header: "User", key: "user" },
        { header: "Amount", key: "amount" },
        { header: "Method", key: "method" },
        { header: "Status", key: "status" },
        { header: "Date", key: "date" },
      ];

      rows = payments.map((item, index) => ({
        id: index + 1,
        user: toProperCase(item.userId?.name),
        amount: `PHP ${parseFloat(item.amount).toFixed(2)}`,
        method: toProperCase(item.paymentMethod),
        status: toProperCase(item.status),
        date: formatDateTime(item.paymentDate),
      }));

      title = `Payment Report - ${formatDate(
        new Date(dateFrom)
      )} to ${formatDate(new Date(dateTo))}`;
      break;
    }

    case "audit": {
      const audits = await getAuditLogsByDateRange({ dateFrom, dateTo });

      columns = [
        { header: "#", key: "id" },
        { header: "User", key: "user" },
        { header: "Email", key: "email" },
        { header: "Action", key: "action" },
        { header: "IP Address", key: "ipAddress" },
        { header: "Date", key: "date" },
      ];

      rows = audits.map((item, index) => ({
        id: index + 1,
        user:
          item.userId === null
            ? toProperCase(item.details?.body?.name)
            : toProperCase(item.userId?.name),
        email:
          item.userId === null ? item.details?.body?.email : item.userId?.email,
        action: item.action?.toUpperCase(),
        ipAddress: item.ipAddress?.toUpperCase(), // Keeping IP uppercase, usually better
        date: formatDateTime(item.createdAt),
      }));

      title = `Audit Log Report - ${formatDate(
        new Date(dateFrom)
      )} to ${formatDate(new Date(dateTo))}`;
      break;
    }

    default:
      throw new Error("Invalid report type");
  }

  return { title, rows, columns };
};
