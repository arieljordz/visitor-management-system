import AuditLog from "../models/AuditLog.js";
import VisitDetail from "../models/VisitDetail.js";
import PaymentDetail from "../models/PaymentDetail.js";
import Visitor from "../models/Visitor.js";
import QRCode from "../models/QRCode.js";
import ScanLog from "../models/ScanLog.js";
import { TransactionEnum } from "../enums/enums.js";
import { convertDateRangeToUTC } from "../utils/globalUtils.js";

// export const getVisitorsByDateRange = async (req, res) => {
//   const { dateFrom, dateTo } = req.query;

//   if (!dateFrom || !dateTo) {
//     return res.status(400).json({ message: "Date range is required." });
//   }

//   try {
//     const visits = await VisitDetail.find({
//       visitDate: {
//         $gte: new Date(dateFrom),
//         $lte: new Date(dateTo),
//       },
//     }).populate({
//       path: "visitorId",
//       populate: {
//         path: "userId",
//         select: "-password",
//       },
//     });

//     res.status(200).json(visits);
//   } catch (error) {
//     console.error("Error fetching visit report:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// };

export const getVisitorsByDateRange = async (req, res) => {
  const { dateFrom, dateTo, department, subscriberId } = req.query;

  if (!dateFrom || !dateTo || !subscriberId) {
    return res
      .status(400)
      .json({ message: "Date range and subscriberId are required." });
  }

  try {
    // Convert Manila date range to UTC
    const { startDate, endDate } = convertDateRangeToUTC(dateFrom, dateTo, "Asia/Manila");

    // Step 1: Fetch visitors created by the subscriber
    const visitorIds = await Visitor.find({ userId: subscriberId }).distinct(
      "_id"
    );

    // Step 2: Build VisitDetail query
    const query = {
      visitDate: { $gte: startDate, $lte: endDate },
      visitorId: { $in: visitorIds },
    };

    if (department && department !== "All") {
      query.department = department;
    }

    // Step 3: Fetch VisitDetails
    const visitDetails = await VisitDetail.find(query)
      .populate({
        path: "visitorId",
        populate: {
          path: "userId",
          select: "-password",
        },
      })
      .lean();

    // Step 4: Enrich with QRCode and ScanLog data
    const enrichedData = await Promise.all(
      visitDetails.map(async (visit) => {
        const qrCode = await QRCode.findOne({ visitDetailsId: visit._id })
          .populate("userId", "name email")
          .populate(
            "visitorId",
            "visitorType firstName lastName groupName visitorImage"
          )
          .lean();

        const scanLogs = qrCode
          ? await ScanLog.find({ qrCodeId: qrCode._id })
              .populate("scannedBy", "name email")
              .lean()
          : [];

        return {
          visitDetail: visit,
          qrCode,
          scanLogs,
        };
      })
    );

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error("Error fetching visit report:", error);
    res.status(500).json({ message: "Server error." });
  }
};



export const getPaymentDetailsByDateRange = async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: "Date range is required." });
  }

  try {
    // Convert Manila date range to UTC
    const { startDate, endDate } = convertDateRangeToUTC(dateFrom, dateTo, "Asia/Manila");

    const payments = await PaymentDetail.find({
      transaction: TransactionEnum.CREDIT,
      paymentDate: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate({ path: "userId", select: "-password" })
      .populate("visitorId")
      .lean();

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payment report:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getAuditLogsByDateRange = async (req, res) => {
  const { dateFrom, dateTo } = req.query;

  if (!dateFrom || !dateTo) {
    return res.status(400).json({ message: "Date range is required." });
  }

  try {
    // Convert Manila date range to UTC
    const { startDate, endDate } = convertDateRangeToUTC(dateFrom, dateTo, "Asia/Manila");

    const logs = await AuditLog.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate({
        path: "userId",
        select: "-password", // exclude password
      })
      .lean();

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Server error." });
  }
};
