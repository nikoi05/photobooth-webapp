import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.resolve("uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueSuffix + path.extname(file.originalname)
        );
    },
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
];

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPEG, PNG, WEBP, and HEIC images are allowed"
            ),
            false
        );
    }
};

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});