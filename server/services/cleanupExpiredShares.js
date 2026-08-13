import supabase from "../database/supabase.js";

export default async function cleanupExpiredShares() {
    const BUCKET = process.env.SUPABASE_BUCKET_NAME; // read at call time, not module load
    try {
        const now = new Date().toISOString();

        // Find expired shares
        const { data: expiredShares, error: fetchError } = await supabase
            .from("shares")
            .select("share_id, storage_path, expires_at")
            .lt("expires_at", now);

        if (fetchError) {
            throw new Error(
                `Failed to find expired shares: ${fetchError.message}`
            );
        }

        if (!expiredShares || expiredShares.length === 0) {
            console.log("No expired shares found.");
            return;
        }

        for (const share of expiredShares) {

            // Delete the image from Supabase Storage
            const { error: storageError } = await supabase.storage
                .from(BUCKET)
                .remove([share.storage_path]);

            if (storageError) {
                console.error(
                    `Failed to delete ${share.storage_path}:`,
                    storageError.message
                );

                continue;
            }

            console.log(
                "Deleted file:",
                share.storage_path
            );

            // Delete the database record
            const { error: deleteError } = await supabase
                .from("shares")
                .delete()
                .eq("share_id", share.share_id);

            if (deleteError) {
                console.error(
                    `Failed to delete share ${share.share_id}:`,
                    deleteError.message
                );

                continue;
            }

            console.log(
                "Removed share:",
                share.share_id
            );
        }

    } catch (error) {
        console.error(
            "Error cleaning expired shares:",
            error
        );
    }
}