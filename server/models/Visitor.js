import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    visitorType: {
      type: String,
      enum: ["Individual", "Group"],
      required: true,
    },
    firstName: {
      type: String,
      required: function () {
        return this.VisitorType === "Individual";
      },
    },
    lastName: {
      type: String,
      required: function () {
        return this.VisitorType === "Individual";
      },
    },
    groupName: {
      type: String,
      required: function () {
        return this.VisitorType === "Group";
      },
    },
    noOfVisitors: {
      type: Number,
      required: function () {
        return this.VisitorType === "Group";
      },
    },
    visitDate: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    classification: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", VisitorSchema);
