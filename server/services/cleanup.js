import cleanupExpiredShares from "../services/cleanupExpiredShares.js";
import cleanupOrphanedUploads from "../services/cleanupOrphanedUploads.js";

const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function startCleanupJob() {

    console.log("[cleanup] Cleanup job started.");

    // Run immediately when server starts
    runCleanup();

    // Run every 5 minutes
    setInterval(runCleanup, CLEANUP_INTERVAL);
}

async function runCleanup() {

    console.log("[cleanup] Running cleanup...");

    try {
        await cleanupExpiredShares();
    } catch (error) {
        console.error(
            "[cleanup] Expired shares cleanup failed:",
            error
        );
    }

    try {
        await cleanupOrphanedUploads();
    } catch (error) {
        console.error(
            "[cleanup] Orphaned uploads cleanup failed:",
            error
        );
    }

    console.log("[cleanup] Cleanup finished.");
}