import mongoose from "mongoose";
import { VisitorTypeEnum } from "../enums/enums.js";  

const VisitorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitorType: {
      type: String,
      enum: Object.values(VisitorTypeEnum), 
      required: true,
    },
    firstName: {
      type: String,
      required: function () {
        return this.visitorType === VisitorTypeEnum.INDIVIDUAL; 
      },
    },
    lastName: {
      type: String,
      required: function () {
        return this.visitorType === VisitorTypeEnum.INDIVIDUAL;  
      },
    },
    groupName: {
      type: String,
      required: function () {
        return this.visitorType === VisitorTypeEnum.GROUP; 
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", VisitorSchema);
