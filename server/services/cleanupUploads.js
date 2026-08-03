import fs from "fs/promises";
import path from "path";

const UPLOADS_FOLDER = "./uploads";

// Delete orphaned upload files older than 1 hour.
// Under normal operation uploads are deleted inline by image-processing.service.js
// right after the strip is composed. This catches any files left behind by
// failed or interrupted requests.
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export default async function cleanupOrphanedUploads() {
  try {
    const files = await fs.readdir(UPLOADS_FOLDER);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(UPLOADS_FOLDER, file);

      try {
        const stats = await fs.stat(filePath);
        const age = now - stats.birthtimeMs;

        if (age > MAX_AGE_MS) {
          await fs.unlink(filePath);
          console.log("[cleanup] Deleted orphaned upload:", file);
        }
      } catch (err) {
        // File may have been deleted between readdir and stat — ignore
        console.warn("[cleanup] Could not process upload file:", file, err.message);
      }
    }
  } catch (err) {
    // uploads folder missing entirely — nothing to do
    if (err.code !== "ENOENT") {
      console.error("[cleanup] cleanupOrphanedUploads failed:", err);
    }
  }
}
