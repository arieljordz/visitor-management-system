import Setting from "../models/Settings.js";

// Get current settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (!settings) {
      return res.status(404).json({ message: "No settings found." });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create or update settings
export const upsertSettings = async (req, res) => {
  try {
    const { title, header, sideHeader, navBarColor, sideBarColor, favicon } = req.body;

    // Validate required fields
    if (!title || !header || !sideHeader || !navBarColor || !sideBarColor || !favicon) {
      return res.status(400).json({ message: "All fields including favicon are required." });
    }

    let settings = await Setting.findOne();
    if (settings) {
      // Update existing settings
      settings = await Setting.findByIdAndUpdate(
        settings._id,
        { title, header, sideHeader, navBarColor, sideBarColor, favicon },
        { new: true }
      );
    } else {
      // Create new settings
      settings = await Setting.create({ title, header, sideHeader, navBarColor, sideBarColor, favicon });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
