import Visitor from "../models/Visitor.js";
import QRCode from "../models/QRCode.js";


export const createVisitor = async (req, res) => {
  console.log("Visitor data:", req.body);

  try {
    const {
      userId,
      visitorType,
      firstName,
      lastName,
      groupName,
      noOfVisitors,
      visitDate,
      purpose,
      classification,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    let existingVisitor;

    if (visitorType === "Individual") {
      if (!firstName || !lastName) {
        return res.status(400).json({
          message:
            "First name and last name are required for Individual visitors.",
        });
      }

      existingVisitor = await Visitor.findOne({
        userId,
        visitorType: "Individual",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } else if (visitorType === "Group") {
      if (!groupName) {
        return res.status(400).json({
          message: "Group name is required for Group visitors.",
        });
      }

      existingVisitor = await Visitor.findOne({
        userId,
        visitorType: "Group",
        groupName: groupName.trim(),
      });
    }

    if (existingVisitor) {
      return res.status(409).json({
        message: `${
          visitorType === "Individual" ? "Visitor name" : "Group name"
        } already exists.`,
      });
    }

    const newVisitor = new Visitor({
      userId,
      visitorType,
      firstName,
      lastName,
      groupName,
      noOfVisitors,
      visitDate,
      purpose,
      classification,
    });

    const savedVisitor = await newVisitor.save();

    res.status(201).json({
      message: "Visitor saved successfully.",
      data: savedVisitor,
    });
  } catch (error) {
    console.error("Error saving visitor:", error);
    res.status(500).json({
      message: "Failed to save visitor.",
      error: error.message,
    });
  }
};

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

// GET visitor by user ID
export const getVisitorByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all visitors for the user, sorted by dateCreated descending
    const visitors = await Visitor.find({ userId })
      .sort({ createdAt: -1 }) // descending order
      .lean(); // lean for performance

    if (!visitors || visitors.length === 0) {
      return res.status(404).json({ message: "No visitors found." });
    }

    // Step 2: For each visitor, find their active QR code
    const visitorsWithActiveQR = await Promise.all(
      visitors.map(async (visitor) => {
        const activeQRCode = await QRCode.findOne({
          visitorId: visitor._id,
          status: "active",
        }).lean();

        return {
          ...visitor,
          activeQRCode: activeQRCode || null,
        };
      })
    );

    // Step 3: Respond with enriched data
    res.status(200).json({ data: visitorsWithActiveQR });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    res.status(500).json({ message: "Server error while fetching visitors." });
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
