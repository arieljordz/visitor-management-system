import MenuConfig from "../models/MenuConfig.js";

// GET /api/menu-config/:role
export const getMenuByRole = async (req, res) => {
  try {
    const menu = await MenuConfig.findOne({ role: req.params.role });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/menu-config
export const upsertMenuConfig = async (req, res) => {
  const { role, menuItems } = req.body;
  try {
    const updated = await MenuConfig.findOneAndUpdate(
      { role },
      { menuItems },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
