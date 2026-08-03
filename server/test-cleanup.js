import cleanupExpiredOutputs from "./services/cleanupService.js";
import cleanupExpiredShares from "./services/layouts/cleanupShared.js";

console.log("--- Running cleanup test ---");

try {
    console.log("\n[1] Cleaning up expired output files...");
    await cleanupExpiredOutputs();
    console.log("[1] Done.");
} catch (err) {
    console.error("[1] cleanupExpiredOutputs failed:", err);
}

try {
    console.log("\n[2] Cleaning up expired share records...");
    await cleanupExpiredShares();
    console.log("[2] Done.");
} catch (err) {
    console.error("[2] cleanupExpiredShares failed:", err);
}

console.log("\n--- Cleanup test complete ---");
