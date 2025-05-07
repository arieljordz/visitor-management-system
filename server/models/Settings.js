import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    header: { type: String, required: true, unique: true },
    sideHeader: { type: String, required: true, unique: true },
    navBarColor: { type: String, required: true, unique: true },
    sideBarColor: { type: String, required: true, unique: true },
    favicon: { type: String, required: true, default: "/images/vms-icon.png" },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", SettingSchema);
