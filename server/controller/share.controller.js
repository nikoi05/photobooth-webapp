import { getShare } from "../services/share.service.js";

export function getSharedStrip(req, res) {
    const { shareId } = req.params;

    const share = getShare(shareId);

    if (!share) {
        return res.status(404).json({
            success: false,
            message: "Share not found."
        });
    }

    if (Date.now() > share.expires_at) {
        return res.status(410).json({
            success: false,
            message: "This photo strip has expired."
        });
    }

    return res.json({
    
        success: true,
        shareId: share.share_id,
        imageUrl: `/output/${share.filename}`,
        filename: share.filename,
        expiresAt: share.expires_at
    });
}