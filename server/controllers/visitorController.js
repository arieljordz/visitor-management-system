import mongoose from "mongoose";
import moment from "moment";
import fs from "fs";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";
import QRCode from "../models/QRCode.js";
import VisitDetail from "../models/VisitDetail.js";
import {
  VisitorTypeEnum,
  PlanLimitEnum,
  PlanTypeEnum,
  UserRoleEnum,
} from "../enums/enums.js";
import cloudinary from "../utils/cloudinaryUtils.js";

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
    res
      .status(500)
      .json({ message: "Server error while fetching visitor details." });
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
    const deletedVisitDetail = await VisitDetail.findByIdAndDelete(
      visitDetailId
    );
    if (!deletedVisitDetail) {
      return res.status(404).json({ message: "Visit detail not found." });
    }

    res.status(200).json({
      message: "Visit detail deleted successfully.",
      deletedVisitDetail,
    });
  } catch (error) {
    console.error("Error deleting visit detail:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting visit detail." });
  }
};

// UPDATE visitor by ID
export const updateVisitor = async (req, res) => {
  try {
    // console.log("Request body:", req.body);
    const { id: visitDetailId } = req.params;
    const {
      visitorType,
      firstName,
      lastName,
      groupName,
      visitDate,
      purpose,
      department,
      classification,
      noOfVisitors,
      validity,
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
      return res
        .status(400)
        .json({ message: "Invalid associated visitor ID." });
    }

    // Validate visitorType-specific fields
    if (visitorType === VisitorTypeEnum.INDIVIDUAL) {
      if (!firstName || !lastName) {
        return res.status(400).json({
          message:
            "First name and last name are required for individual visitors.",
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

        // Upload image if a file was provided
    let visitorImageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "visitors",
      });
      visitorImageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Update Visitor
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      {
        visitorType,
        firstName,
        lastName,
        groupName,
        ...(visitorImageUrl && { visitorImage: visitorImageUrl }),
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
        classification,
        noOfVisitors: noOfVisitors || 1,
        validity,
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
    res.status(500).json({
      message: "Server error while updating visitor and visit detail.",
    });
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
      validity,
    } = req.body;

    if (
      !userId ||
      !visitorType ||
      !visitDate ||
      !purpose ||
      !department ||
      !classification ||
      !noOfVisitors
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const visitDateOnly = moment(visitDate).startOf("day");
    const today = moment().startOf("day");

    if (visitDateOnly.isBefore(today)) {
      return res
        .status(400)
        .json({ message: "Visit date cannot be earlier than today." });
    }

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }
    // ✅ Fetch user to enforce plan limit
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Only enforce limit for subscribers
    if (user.role === UserRoleEnum.SUBSCRIBER) {
      const planType = user.planType;

      // console.log("user:", user);
      // Lookup plan limit using the ENUM mapping
      const planLimit =
        PlanLimitEnum[
          Object.keys(PlanTypeEnum).find(
            (key) => PlanTypeEnum[key] === planType
          )
        ] ?? 0;

      const currentVisitorCount = await Visitor.countDocuments({ userId });

      if (currentVisitorCount >= planLimit) {
        return res.status(403).json({
          message: `You have reached the limit of ${planLimit} visitors for your "${planType}" plan.`,
        });
      }
    }

    let visitorImageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "visitors",
      });
      visitorImageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

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

      const newVisit = new VisitDetail({
        visitorId: existingVisitor._id,
        userId,
        visitDate,
        purpose,
        department,
        classification,
        noOfVisitors:
          visitorType === VisitorTypeEnum.GROUP ? noOfVisitors : undefined,
        validity,
      });

      const savedVisit = await newVisit.save();

      return res.status(201).json({
        message: "Visit detail saved for existing visitor.",
        visitorId: existingVisitor._id,
        visitDetail: savedVisit,
      });
    }

    const newVisitor = new Visitor({
      userId,
      visitorType,
      firstName:
        visitorType === VisitorTypeEnum.INDIVIDUAL
          ? firstName?.trim()
          : undefined,
      lastName:
        visitorType === VisitorTypeEnum.INDIVIDUAL
          ? lastName?.trim()
          : undefined,
      groupName:
        visitorType === VisitorTypeEnum.GROUP ? groupName?.trim() : undefined,
      visitorImage: visitorImageUrl,
    });

    const savedVisitor = await newVisitor.save();

    const newVisit = new VisitDetail({
      visitorId: savedVisitor._id,
      userId,
      visitDate,
      purpose,
      department,
      classification,
      noOfVisitors:
        visitorType === VisitorTypeEnum.GROUP ? noOfVisitors : undefined,
      validity,
    });

    const savedVisit = await newVisit.save();

    return res.status(201).json({
      message: "New visitor and visit detail saved successfully.",
      visitorId: savedVisitor._id,
      visitDetail: savedVisit,
    });
  } catch (error) {
    console.error("Error creating visitor detail:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getVisitorNames = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  // console.log("userId:", id);
  try {
    if (type === VisitorTypeEnum.INDIVIDUAL) {
      const visitors = await Visitor.find({
        userId: id,
        visitorType: VisitorTypeEnum.INDIVIDUAL,
      }).select("firstName lastName");
      return res.json(visitors);
    } else if (type === VisitorTypeEnum.GROUP) {
      const groups = await Visitor.find({
        userId: id,
        visitorType: VisitorTypeEnum.GROUP,
      }).select("groupName");
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
      visitDetailsId: { $in: visitDetailIds },
    }).lean();

    const qrCodeMap = new Map(
      qrCodes.map((qr) => [qr.visitDetailsId.toString(), qr])
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
          validity: visit.validity,
          noOfVisitors:
            visitor.visitorType === VisitorTypeEnum.GROUP
              ? visit.noOfVisitors
              : null,
          activeQRCode: qrCodeMap.get(visit._id.toString()) || null,
        };
      });

      return {
        _id: visitor._id,
        userId: visitor.userId,
        visitorType: visitor.visitorType,
        firstName:
          visitor.visitorType === VisitorTypeEnum.INDIVIDUAL
            ? visitor.firstName
            : null,
        lastName:
          visitor.visitorType === VisitorTypeEnum.INDIVIDUAL
            ? visitor.lastName
            : null,
        groupName:
          visitor.visitorType === VisitorTypeEnum.GROUP
            ? visitor.groupName
            : null,
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
