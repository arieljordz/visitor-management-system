import AuditLog from "../models/AuditLog.js";
import VisitDetail from "../models/VisitDetail.js";
import PaymentDetail from "../models/PaymentDetail.js";
import { TransactionEnum } from "../enums/enums.js";

export const getVisitorsByDateRange = async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: "Date range is required." });
  }

  try {
    const visits = await VisitDetail.find({
      visitDate: {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      },
    }).populate({
      path: "visitorId",
      populate: {
        path: "userId",
        select: "-password",
      },
    });

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error fetching visit report:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getPaymentDetailsByDateRange = async (req, res) => {
  let { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: "Date range is required." });
  }

  try {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999); // extend end date to end-of-day

    const payments = await PaymentDetail.find({
      transaction: TransactionEnum.CREDIT,
      paymentDate: {
        $gte: start,
        $lte: end,
      },
    })
      .populate({ path: "userId", select: "-password" })
      .populate("visitorId");

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching debit payments:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getAuditLogsByDateRange = async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: "Date range is required." });
  }

  try {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999); // include full day of dateTo

    const logs = await AuditLog.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    }).populate({
      path: "userId",
      select: "-password", // Exclude password
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Server error." });
  }
};
