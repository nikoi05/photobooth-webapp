import express from "express";
import upload from "../middleware/upload.middleware.js";
import { uploadPhotos } from "../controller/upload.controller.js";

const router = express.Router();

// POST /api/upload/generate
// Field name "photo" must match what the client sends in FormData
router.post("/generate", upload.array("photos"),uploadPhotos
);

export default router;
