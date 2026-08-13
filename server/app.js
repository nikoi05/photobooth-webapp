import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import uploadRoutes from "./routes/upload.routes.js";
import shareRoutes from "./routes/share.route.js";
import testRoutes from "./routes/test.route.js";

import cleanupExpiredShares from "./services/cleanupExpiredShares.js";
import cleanupOrphanedUploads from "./services/cleanupUploads.js";

const app = express();

// ── Cleanup function ─────────────────────────────────────────
async function runCleanup() {
    console.log("[cleanup] Running cleanup jobs...");

    await Promise.allSettled([
        cleanupExpiredShares(),
        cleanupOrphanedUploads(),
    ]);

    console.log("[cleanup] Cleanup finished.");
}

// Run cleanup when server starts
runCleanup();

// Run cleanup every 30 minutes
cron.schedule("*/30 * * * *", () => {
    runCleanup();
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/upload", uploadRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/test", testRoutes);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});