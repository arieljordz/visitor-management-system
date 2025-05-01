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

    if (!userId || !visitorType || !visitDate || !purpose || !classification) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let finalVisitorId = visitorId;

    // If visitorId is not provided, create a new visitor
    if (!visitorId) {
      const newVisitorPayload = {
        userId,
        visitorType,
        firstName: visitorType === "Individual" ? firstName : undefined,
        lastName: visitorType === "Individual" ? lastName : undefined,
        groupName: visitorType === "Group" ? groupName : undefined,
      };

      // Validate based on type
      if (
        visitorType === "Individual" &&
        (!firstName?.trim() || !lastName?.trim())
      ) {
        return res.status(400).json({
          message: "First name and last name are required for individual type.",
        });
      }

      if (visitorType === "Group" && !groupName?.trim()) {
        return res.status(400).json({
          message: "Group name is required for group type.",
        });
      }

      // Check if the visitor already exists
      const existingVisitor = await Visitor.findOne({
        $or: [
          { firstName, lastName, visitorType: "Individual" },
          { groupName, visitorType: "Group" },
        ],
      });

      if (existingVisitor) {
        return res.status(400).json({
          message: "Visitor already exists with the same name or group name.",
        });
      }

      const newVisitor = new Visitor(newVisitorPayload);
      const savedVisitor = await newVisitor.save();
      finalVisitorId = savedVisitor._id;
    }

    // Check if the visitor already has a visit record for the same visit date
    const existingVisit = await VisitDetail.findOne({
      visitorId: finalVisitorId,
      visitDate,
    });

    if (existingVisit) {
      return res.status(400).json({
        message: "Visit already exists for this visitor on the given date.",
      });
    }

    // Create the visit detail
    const visitPayload = {
      visitorId: finalVisitorId,
      userId,
      visitDate,
      purpose,
      classification,
      noOfVisitors: visitorType === "Group" ? noOfVisitors : undefined,
      qrCode: {
        qrData: uuidv4(),
        status: "pending",
      },
    };

    const newVisit = new VisitDetail(visitPayload);
    const savedVisit = await newVisit.save();

    res.status(201).json({
      message: "Visitor and visit detail saved successfully.",
      visitorId: finalVisitorId,
      visitDetail: savedVisit,
    });
  } catch (error) {
    console.error("Error handling visitor with details:", error);

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
    console.log("userId:", userId);

    // Step 1: Find all visit details for the user, sorted by visitDate descending
    const visitDetails = await VisitDetail.find({ userId })
      .sort({ visitDate: -1 }) // descending order of visitDate
      .lean(); // lean for performance

    if (!visitDetails || visitDetails.length === 0) {
      return res
        .status(404)
        .json({ message: "No visit details found for the user." });
    }

    // Step 2: For each visit, find the corresponding visitor and their active QR code
    const visitorsWithDetails = await Promise.all(
      visitDetails.map(async (visitDetail) => {
        // Fetch the corresponding visitor
        const visitor = await Visitor.findById(visitDetail.visitorId).lean();

        // Fetch the active QR code for this visitor
        const activeQRCode = await QRCode.findOne({
          visitorId: visitor._id,
          status: "active",
        }).lean();

        // Enrich visitor data with visit details and QR code
        return {
          ...visitor,
          visitDetail: visitDetail,
          activeQRCode: activeQRCode || null,
          // Include the 'noOfVisitors' from visitDetail if visitor type is 'Group'
          noOfVisitors:
            visitor.visitorType === "Group" ? visitDetail.noOfVisitors : null,
        };
      })
    );

    console.log("visitorsWithDetails:", visitorsWithDetails);

    // Step 3: Respond with enriched data
    res.status(200).json({ data: visitorsWithDetails });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error while fetching visitors." });
  }
};
