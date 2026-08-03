import express from "express";
import { getSharedStrip } from "../controller/share.controller.js";

const router = express.Router();

router.get("/:shareId", getSharedStrip);

export default router;