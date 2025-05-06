import MenuConfig from "../models/MenuConfig.js";


export const createMenuConfig = async (req, res) => {
  const { role, menuItems } = req.body;
  try {
    // Check if the role already has a menu config
    const existingConfig = await MenuConfig.findOne({ role });
    if (existingConfig) {
      return res.status(400).json({ message: "Menu config for this role already exists" });
    }

    const newMenuConfig = new MenuConfig({ role, menuItems });
    await newMenuConfig.save();
    res.status(201).json(newMenuConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuByRole = async (req, res) => {
  try {
    const menu = await MenuConfig.findOne({ role: req.params.role });
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
