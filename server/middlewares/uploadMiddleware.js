import multer from "multer";
import path from "path";

// Set up the destination and filename for storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where files should be uploaded
    cb(null, "uploads/"); // Ensure this folder exists or create it dynamically
  },
  filename: function (req, file, cb) {
    // Use the current timestamp and original file extension to create unique filenames
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

export default upload;
