import { getShare } from "../services/share.service.js";
import { getSignedImageUrl } from "../services/StorageService.js";

export async function getSharedStrip(req, res) {
    try {
        const { shareId } = req.params;

        const share = await getShare(shareId);

        if (!share) {
            return res.status(404).json({
                success: false,
                message: "Share not found."
            });
        }

        const expiresAt = new Date(share.expires_at).getTime();

        if (Date.now() > expiresAt) {
            return res.status(410).json({
                success: false,
                message: "This photo strip has expired."
            });
        }

        // Signed URL is valid for 10 minutes
        const imageUrl = await getSignedImageUrl(
            share.storage_path,
            10 * 60
        );

        return res.json({
            success: true,
            shareId: share.share_id,
            imageUrl,
            filename: share.storage_path.split("/").pop(),
            expiresAt: expiresAt
        });

    } catch (error) {
        console.error("Error retrieving shared strip:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve photo strip."
        });
    }
}