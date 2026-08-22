import { API_URL } from "../config/api.js";
import { applyFilterToImage } from "./applyFilterToImage.js";
import { convertHeicToJpeg } from "./convertHeic.js";

/**
 * uploadPhotoStrip
 *
 * For each photo:
 *   1. convertHeicToJpeg  — HEIC → JPEG + fix EXIF orientation (no-op if already JPEG)
 *   2. applyFilterToImage — bake filter into pixels using deterministic pixel engine
 *   3. append to FormData
 *
 * The backend receives already-filtered JPEGs and filterId "none" so it
 * composites without applying any filter a second time.
 *
 * @param {Array<{file: File, previewUrl: string}>} photos
 * @param {{ id: string, label: string, adjustments: object }} filter
 * @param {string} format — format id e.g. "strip-4"
 */
export async function uploadPhotoStrip(photos, filter, format) {
    const formData = new FormData();

    for (let i = 0; i < photos.length; i++) {
        const photo    = photos[i];
        const filename = `photo-${i + 1}.jpg`;

        // Step 1 — convert HEIC → JPEG and fix EXIF orientation
        const jpegFile = await convertHeicToJpeg(photo.file);

        // Step 2 — bake filter into pixels (no-op if filter.id === "none")
        const filteredFile = await applyFilterToImage(jpegFile, filter, filename);

        formData.append("photos", filteredFile, filename);
    }

    // Filter already baked in — tell backend to skip it
    formData.append("FormatId", format);
    formData.append("filterId", "none");

    const response = await fetch(`${API_URL}/api/upload/generate`, {
        method: "POST",
        body: formData,
    });

    const text = await response.text();
    if (!response.ok) {
        throw new Error(`Upload failed (${response.status}): ${text}`);
    }

    return JSON.parse(text);
}
