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
        return this.visitorType === "Individual";
      },
    },
    lastName: {
      type: String,
      required: function () {
        return this.visitorType === "Individual";
      },
    },
    groupName: {
      type: String,
      required: function () {
        return this.visitorType === "Group";
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", VisitorSchema);
