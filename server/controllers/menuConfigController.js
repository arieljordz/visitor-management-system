import MenuConfig from "../models/MenuConfig.js";
import { UserRoleEnum, MenuEnum, SubMenuEnum } from "../enums/enums.js";

export const createMenuConfig = async (req, res) => {
  const { role, menuItems } = req.body;
  try {
    // Check if the role already has a menu config
    const existingConfig = await MenuConfig.findOne({ role });
    if (existingConfig) {
      return res
        .status(400)
        .json({ message: "Menu config for this role already exists" });
    }

    const newMenuConfig = new MenuConfig({ role, menuItems });
    await newMenuConfig.save();
    res.status(201).json(newMenuConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getMenuByRole = async (req, res) => {
//   try {
//     const menu = await MenuConfig.findOne({ role: req.params.role });
//     if (!menu) return res.status(404).json({ message: "Menu not found" });
//     res.json(menu);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getMenuByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const subscription = req.query.subscription === "true";

    const menuDoc = await MenuConfig.findOne({ role }).lean();

    if (!menuDoc) return res.status(404).json({ message: "Menu not found" });

    let menuItems = menuDoc.menuItems;

    if (role !== UserRoleEnum.ADMIN) {
      if (!subscription) {
        // Restrict these for non-subscribers
        let restrictedTopLevel = [MenuEnum.PAYMENT_HISTORY, MenuEnum.REPORTS];

        // Allow Reports for STAFF role even without subscription
        if (role === UserRoleEnum.STAFF) {
          restrictedTopLevel = restrictedTopLevel.filter(
            (item) => item !== MenuEnum.REPORTS
          );
        }

        const allowedFileMaintenanceSubmenu = [
          SubMenuEnum.DEPARTMENTS,
          SubMenuEnum.CLASSIFICATIONS,
          SubMenuEnum.ACCOUNTS,
        ];

        menuItems = menuItems
          .map((item) => {
            if (restrictedTopLevel.includes(item.label)) return null;

            if (item.label === MenuEnum.FILE_MAINTENANCE) {
              const filteredSubmenu = (item.submenu || []).filter((sub) =>
                allowedFileMaintenanceSubmenu.includes(sub.label)
              );

              return filteredSubmenu.length > 0
                ? { ...item, submenu: filteredSubmenu, path: item.path?.trim() || "#" }
                : null;
            }

            if (item.submenu && item.submenu.length > 0) {
              const filteredSub = item.submenu.filter(
                (sub) => !restrictedTopLevel.includes(sub.label)
              );
              return filteredSub.length > 0
                ? { ...item, submenu: filteredSub }
                : { ...item, submenu: [] };
            }

            return item;
          })
          .filter(Boolean);
      }
    }

    res.json({ ...menuDoc, menuItems });
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
