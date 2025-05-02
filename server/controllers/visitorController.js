import Visitor from "../models/Visitor.js";
import QRCode from "../models/QRCode.js";
import VisitDetail from "../models/VisitDetail.js";
import { v4 as uuidv4 } from "uuid";

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
export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }
    res.status(200).json({ data: visitor });
  } catch (error) {
    console.error("Error fetching visitor:", error);
    res.status(500).json({ message: "Server error while fetching visitor." });
  }
};

// DELETE visitor by ID
export const deleteVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVisitor = await Visitor.findByIdAndDelete(id);
    if (!deletedVisitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }
    res.status(200).json({ message: "Visitor deleted successfully." });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    res.status(500).json({ message: "Server error while deleting visitor." });
  }
};

// UPDATE visitor by ID
export const updateVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVisitor = await Visitor.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedVisitor) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    res.status(200).json({
      message: "Visitor updated successfully.",
      data: updatedVisitor,
    });
  } catch (error) {
    console.error("Error updating visitor:", error);
    res.status(500).json({ message: "Server error while updating visitor." });
  }
};

// GET /api/visitors/search
export const searchVisitor = async (req, res) => {
  try {
    const { firstName, lastName, groupName } = req.query;
    let query = {};

    if (firstName && lastName) {
      query = {
        visitorType: "Individual",
        firstName: new RegExp(`^${firstName}$`, "i"),
        lastName: new RegExp(`^${lastName}$`, "i"),
      };
    } else if (groupName) {
      query = {
        visitorType: "Group",
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
      visitorId, // Optional (if visitor already exists)
      userId,
      visitorType,
      firstName,
      lastName,
      groupName,
      visitDate,
      purpose,
      classification,
      noOfVisitors,
    } = req.body;

    // Check for required fields
    if (!userId || !visitorType || !visitDate || !purpose || !classification) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let finalVisitorId = visitorId;

    // Validate based on visitor type
    if (
      visitorType === "Individual" &&
      (!firstName?.trim() || !lastName?.trim())
    ) {
      return res.status(400).json({
        message: "First name and last name are required for individual type.",
      });
    }

    if (visitorType === "Group" && !groupName?.trim()) {
      return res
        .status(400)
        .json({ message: "Group name is required for group type." });
    }

    // Step 1: Check if a visitor with matching name/group exists
    const existingVisitor = await Visitor.findOne({
      $or: [
        { firstName, lastName, visitorType: "Individual" },
        { groupName, visitorType: "Group" },
      ],
    });

    if (existingVisitor) {
      // Step 2: Check if a visit already exists on the same date (ignoring time)
      const visitStart = new Date(visitDate);
      visitStart.setHours(0, 0, 0, 0);

      const visitEnd = new Date(visitDate);
      visitEnd.setHours(23, 59, 59, 999);

      const sameDateVisit = await VisitDetail.findOne({
        visitorId: existingVisitor._id,
        visitDate: {
          $gte: visitStart,
          $lte: visitEnd,
        },
      });

      if (sameDateVisit) {
        return res.status(400).json({
          message: "Visit already exists for this visitor on the given date.",
        });
      }

      // Save visit detail only
      const newVisit = new VisitDetail({
        visitorId: existingVisitor._id,
        userId,
        visitDate,
        purpose,
        classification,
        noOfVisitors: visitorType === "Group" ? noOfVisitors : undefined,
      });

      const savedVisit = await newVisit.save();

      return res.status(201).json({
        message: "Visit detail saved for existing visitor.",
        visitorId: existingVisitor._id,
        visitDetail: savedVisit,
      });
    }

    // Step 3: If no existing visitor, create visitor and visit detail
    const newVisitor = new Visitor({
      userId,
      visitorType,
      firstName: visitorType === "Individual" ? firstName : undefined,
      lastName: visitorType === "Individual" ? lastName : undefined,
      groupName: visitorType === "Group" ? groupName : undefined,
    });

    const savedVisitor = await newVisitor.save();
    finalVisitorId = savedVisitor._id;

    const newVisit = new VisitDetail({
      visitorId: finalVisitorId,
      userId,
      visitDate,
      purpose,
      classification,
      noOfVisitors: visitorType === "Group" ? noOfVisitors : undefined,
    });

    const savedVisit = await newVisit.save();

    return res.status(201).json({
      message: "New visitor and visit detail saved successfully.",
      visitorId: finalVisitorId,
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
    if (type === "Individual") {
      const visitors = await Visitor.find({ visitorType: "Individual" }).select(
        "firstName lastName"
      );
      return res.json(visitors);
    } else if (type === "Group") {
      const groups = await Visitor.find({ visitorType: "Group" }).select(
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
    console.log("getVisitorByUserId:", userId);

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

    // Step 3: Fetch all active QR codes associated with visit details
    const activeQRCodes = await QRCode.find({
      visitdetailsId: { $in: visitDetailIds },
      status: "active",
    }).lean();

    const qrCodeMap = new Map(
      activeQRCodes.map((qr) => [qr.visitdetailsId.toString(), qr])
    );

    // Step 4: Map visit details with corresponding visitor and QR code
    const enrichedVisitors = visitDetails.map((visit) => {
      const visitor = visitors.find(
        (v) => v._id.toString() === visit.visitorId.toString()
      );

      return {
        _id: visitor._id,
        visitorType: visitor.visitorType,
        firstName: visitor.firstName || null,
        lastName: visitor.lastName || null,
        groupName: visitor.groupName || null,
        visitDetail: {
          _id: visit._id,
          visitDate: visit.visitDate,
          purpose: visit.purpose,
          classification: visit.classification,
          noOfVisitors:
            visitor.visitorType === "Group" ? visit.noOfVisitors : null,
        },
        activeQRCode: qrCodeMap.get(visit._id.toString()) || null,
      };
    });

    console.log("enrichedVisitors:", enrichedVisitors);
    res.status(200).json({ data: enrichedVisitors });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error while fetching visitors." });
  }
};
