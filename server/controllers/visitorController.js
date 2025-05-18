import mongoose from "mongoose";
import moment from "moment";
import Visitor from "../models/Visitor.js";
import QRCode from "../models/QRCode.js";
import VisitDetail from "../models/VisitDetail.js";
import { VisitorTypeEnum } from "../enums/enums.js";

// GET all visitors
export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json({ data: visitors });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error while fetching visitors." });
  }
};

// GET visitor by ID
export const getVisitorDetailById = async (req, res) => {
  try {
    const { id: visitDetailId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(visitDetailId)) {
      return res.status(400).json({ message: "Invalid visit detail ID." });
    }

    // Find visit detail by ID
    const visitDetail = await VisitDetail.findById(visitDetailId);
    if (!visitDetail) {
      return res.status(404).json({ message: "Visit detail not found." });
    }

    // Find the associated visitor
    const visitor = await Visitor.findById(visitDetail.visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Associated visitor not found." });
    }

    res.status(200).json({
      visitor,
      visitDetail,
    });
  } catch (error) {
    console.error("Error fetching visitor by visitDetailId:", error);
    res.status(500).json({ message: "Server error while fetching visitor details." });
  }
};

// DELETE visitor by ID
export const deleteVisitDetail = async (req, res) => {
  try {
    const { id: visitDetailId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(visitDetailId)) {
      return res.status(400).json({ message: "Invalid visitDetail ID." });
    }

    // Find and delete the specific VisitDetail
    const deletedVisitDetail = await VisitDetail.findByIdAndDelete(visitDetailId);
    if (!deletedVisitDetail) {
      return res.status(404).json({ message: "Visit detail not found." });
    }

    res.status(200).json({
      message: "Visit detail deleted successfully.",
      deletedVisitDetail,
    });
  } catch (error) {
    console.error("Error deleting visit detail:", error);
    res.status(500).json({ message: "Server error while deleting visit detail." });
  }
};

// UPDATE visitor by ID
export const updateVisitor = async (req, res) => {
  try {
    const { id: visitDetailId } = req.params; 
    const {
      visitorType,
      firstName,
      lastName,
      groupName,
      visitDate,
      purpose,
      department,
      categoryType,
      noOfVisitors,
      expiryStatus,
    } = req.body;

    // Validate visitDetailId
    if (!mongoose.Types.ObjectId.isValid(visitDetailId)) {
      return res.status(400).json({ message: "Invalid visit detail ID." });
    }

    // Find the visit detail first
    const visitDetail = await VisitDetail.findById(visitDetailId);
    if (!visitDetail) {
      return res.status(404).json({ message: "Visit detail not found." });
    }

    // Get the related visitor ID from visit detail
    const visitorId = visitDetail.visitorId;
    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({ message: "Invalid associated visitor ID." });
    }

    // Validate visitorType-specific fields
    if (visitorType === VisitorTypeEnum.INDIVIDUAL) {
      if (!firstName || !lastName) {
        return res.status(400).json({
          message: "First name and last name are required for individual visitors.",
        });
      }
    }

    if (visitorType === VisitorTypeEnum.GROUP) {
      if (!groupName) {
        return res.status(400).json({
          message: "Group name is required for group visitors.",
        });
      }
    }

    // Update Visitor
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      {
        visitorType,
        firstName,
        lastName,
        groupName,
      },
      { new: true, runValidators: true }
    );

    if (!updatedVisitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    // Update VisitDetail
    const updatedVisitDetail = await VisitDetail.findByIdAndUpdate(
      visitDetailId,
      {
        visitDate,
        purpose,
        department,
        categoryType,
        noOfVisitors: noOfVisitors || 1,
        expiryStatus,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Visitor and visit detail updated successfully.",
      visitor: updatedVisitor,
      visitDetail: updatedVisitDetail,
    });
  } catch (error) {
    console.error("Error updating visitor and visit detail:", error);
    res.status(500).json({ message: "Server error while updating visitor and visit detail." });
  }
};

// GET /api/visitors/search
export const searchVisitor = async (req, res) => {
  try {
    const { firstName, lastName, groupName } = req.query;
    let query = {};

    if (firstName && lastName) {
      query = {
        visitorType: VisitorTypeEnum.INDIVIDUAL,
        firstName: new RegExp(`^${firstName}$`, "i"),
        lastName: new RegExp(`^${lastName}$`, "i"),
      };
    } else if (groupName) {
      query = {
        visitorType: VisitorTypeEnum.GROUP,
        groupName: new RegExp(`^${groupName}$`, "i"),
      };
    } else {
      return res.status(400).json({ message: "Invalid search parameters." });
    }

    const visitors = await Visitor.find(query);
    res.status(200).json(visitors);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search." });
  }
};

export const createVisitorDetail = async (req, res) => {
  try {
    const {
      visitorId,
      userId,
      visitorType,
      firstName,
      lastName,
      groupName,
      visitDate,
      purpose,
      department,
      classification,
      noOfVisitors,
      expiryStatus,
    } = req.body;

    // console.log("req.body:", req.body);
    // Validate required fields
    if (!userId || !visitorType || !visitDate || !purpose || !department || !classification || !noOfVisitors) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if visitDate is today or in the future
    const visitDateOnly = moment(visitDate).startOf("day");
    const today = moment().startOf("day");

    if (visitDateOnly.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Visit date cannot be earlier than today." });
    }

    // Additional validation based on visitorType
    if (
      visitorType === VisitorTypeEnum.INDIVIDUAL &&
      (!firstName?.trim() || !lastName?.trim())
    ) {
      return res.status(400).json({
        message: "First name and last name are required for individual type.",
      });
    }

    if (visitorType === VisitorTypeEnum.GROUP && !groupName?.trim()) {
      return res
        .status(400)
        .json({ message: "Group name is required for group type." });
    }

    // Step 1: Check for existing visitor by name or group
    const existingVisitor = await Visitor.findOne({
      $or: [
        {
          firstName: firstName?.trim(),
          lastName: lastName?.trim(),
          visitorType: VisitorTypeEnum.INDIVIDUAL,
        },
        {
          groupName: groupName?.trim(),
          visitorType: VisitorTypeEnum.GROUP,
        },
      ],
    });

    if (existingVisitor) {
      // Step 2: Check if visit already exists for this visitor on that date
      const visitStart = visitDateOnly.toDate();
      const visitEnd = moment(visitDate).endOf("day").toDate();

      const sameDateVisit = await VisitDetail.findOne({
        visitorId: existingVisitor._id,
        visitDate: { $gte: visitStart, $lte: visitEnd },
      });

      if (sameDateVisit) {
        return res.status(400).json({
          message: "Visit already exists for this visitor on the given date.",
        });
      }

      // Step 3: Save visit detail
      const newVisit = new VisitDetail({
        visitorId: existingVisitor._id,
        userId,
        visitDate,
        purpose,
        department,
        classification,
        noOfVisitors: visitorType === VisitorTypeEnum.GROUP ? noOfVisitors : undefined,
        expiryStatus,
      });

      const savedVisit = await newVisit.save();

      return res.status(201).json({
        message: "Visit detail saved for existing visitor.",
        visitorId: existingVisitor._id,
        visitDetail: savedVisit,
      });
    }

    // Step 4: Create new visitor and visit detail
    const newVisitor = new Visitor({
      userId,
      visitorType,
      firstName: visitorType === VisitorTypeEnum.INDIVIDUAL ? firstName?.trim() : undefined,
      lastName: visitorType === VisitorTypeEnum.INDIVIDUAL ? lastName?.trim() : undefined,
      groupName: visitorType === VisitorTypeEnum.GROUP ? groupName?.trim() : undefined,
    });

    const savedVisitor = await newVisitor.save();

    const newVisit = new VisitDetail({
      visitorId: savedVisitor._id,
      userId,
      visitDate,
      purpose,
      department,
      classification,
      noOfVisitors: visitorType === VisitorTypeEnum.GROUP ? noOfVisitors : undefined,
      expiryStatus,
    });

    const savedVisit = await newVisit.save();

    return res.status(201).json({
      message: "New visitor and visit detail saved successfully.",
      visitorId: savedVisitor._id,
      visitDetail: savedVisit,
    });
  } catch (error) {
    console.error("Error creating visitor detail:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: messages });
    }

    res.status(500).json({ message: "Server error." });
  }
};

export const getVisitorNames = async (req, res) => {
  const { type } = req.query;

  try {
    if (type === VisitorTypeEnum.INDIVIDUAL) {
      const visitors = await Visitor.find({ visitorType: VisitorTypeEnum.INDIVIDUAL }).select(
        "firstName lastName"
      );
      return res.json(visitors);
    } else if (type === VisitorTypeEnum.GROUP) {
      const groups = await Visitor.find({ visitorType: VisitorTypeEnum.GROUP }).select(
        "groupName"
      );
      return res.json(groups);
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export const getVisitorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log("getVisitorByUserId:", userId);

    // Step 1: Find all visitors associated with the user
    const visitors = await Visitor.find({ userId }).lean();

    if (!visitors.length) {
      return res
        .status(404)
        .json({ message: "No visitors found for the user." });
    }

    const visitorIds = visitors.map((v) => v._id);

    // Step 2: Fetch all visit details for these visitors
    const visitDetails = await VisitDetail.find({
      visitorId: { $in: visitorIds },
    })
      .sort({ visitDate: -1 })
      .lean();

    if (!visitDetails.length) {
      return res
        .status(404)
        .json({ message: "No visit details found for the user." });
    }

    const visitDetailIds = visitDetails.map((v) => v._id);

    // Step 3: Fetch all QR codes associated with these visit details
    const qrCodes = await QRCode.find({
      visitdetailsId: { $in: visitDetailIds },
    }).lean();

    const qrCodeMap = new Map(
      qrCodes.map((qr) => [qr.visitdetailsId.toString(), qr])
    );

    // Step 4: Map visit details with corresponding visitor and QR code
    const enrichedVisitors = visitors.map((visitor) => {
      const visitorVisitDetails = visitDetails.filter(
        (visit) => visit.visitorId.toString() === visitor._id.toString()
      );

      const enrichedVisitDetails = visitorVisitDetails.map((visit) => {
        return {
          _id: visit._id,
          visitDate: visit.visitDate,
          purpose: visit.purpose,
          department: visit.department,
          classification: visit.classification,
          expiryStatus: visit.expiryStatus,
          noOfVisitors:
            visitor.visitorType === VisitorTypeEnum.GROUP ? visit.noOfVisitors : null,
          activeQRCode: qrCodeMap.get(visit._id.toString()) || null,
        };
      });

      return {
        _id: visitor._id,
        userId: visitor.userId,
        visitorType: visitor.visitorType,
        firstName: visitor.visitorType === VisitorTypeEnum.INDIVIDUAL ? visitor.firstName : null,
        lastName: visitor.visitorType === VisitorTypeEnum.INDIVIDUAL ? visitor.lastName : null,
        groupName: visitor.visitorType === VisitorTypeEnum.GROUP ? visitor.groupName : null,
        visitDetails: enrichedVisitDetails,
      };
    });

    // console.log("enrichedVisitors:", enrichedVisitors);
    res.status(200).json({ data: enrichedVisitors });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error while fetching visitors." });
  }
};

