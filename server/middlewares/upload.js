import multer from "multer";

const storage = multer.memoryStorage(); // or configure diskStorage if saving locally
const upload = multer({ storage });

export default upload;
