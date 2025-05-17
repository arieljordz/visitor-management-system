import mongoose from "mongoose";

const SubMenuSchema = new mongoose.Schema({
  label: String,
  path: String,
});

const MenuItemSchema = new mongoose.Schema({
  label: String,
  icon: String,
  path: String,
  submenu: [SubMenuSchema],
});

const MenuConfigSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true }, // e.g. 'admin', 'subscriber', 'staff'
  menuItems: [MenuItemSchema],
});

export default mongoose.model("MenuConfig", MenuConfigSchema);
