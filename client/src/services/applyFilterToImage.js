/**
 * applyFilterToImage
 *
 * Applies a filter to an image file using deterministic pixel processing.
 * Returns a new JPEG File with the filter baked into the pixels.
 *
 * This replaces the old ctx.filter approach which produced inconsistent
 * results across browsers — particularly iOS Safari vs Chrome/Edge.
 *
 * Pipeline:
 *   File → Image → Canvas → getImageData → applyPixelFilter → putImageData → toBlob → File
 *
 * The pixel math uses the same W3C matrix spec as the server-side filterService.js,
 * so preview, client export, and server all produce consistent results.
 *
 * @param {File|Blob} file    — source image (must be JPEG/PNG/WebP, not HEIC)
 * @param {object}    filter  — full filter object { id, label, adjustments }
 * @param {string}    filename
 * @returns {Promise<File>}
 */
import { applyPixelFilter } from "./filter-engine/index.js";

export async function applyFilterToImage(file, filter, filename) {
    // No filter or "none" — return the original file, no re-encoding
    if (!filter || filter.id === "none" || !filter.adjustments) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width  = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext("2d");

            // Draw the raw image — no ctx.filter, no browser compositor involved
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            // Read pixels, apply deterministic filter math, write back
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            applyPixelFilter(imageData, filter.adjustments);
            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Canvas toBlob failed"));
                    resolve(new File([blob], filename, { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.92
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image for filtering: ${file.name}`));
        };

        img.src = url;
    });
}
