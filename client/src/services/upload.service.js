import { API_URL } from "../config/api.js";
import { applyFilterToImage } from "./applyFilterToImage.js";

/**
 * uploadPhotoStrip
 *
 * Applies the CSS filter to each photo in the browser (exact pixel match
 * with the live preview), then uploads the filtered images to the backend.
 * The backend receives filterId "none" so it composites without any
 * additional processing.
 *
 * @param {Array<{file: File, previewUrl: string}>} photos
 * @param {{ id: string, css: string }|string}      filter  — full filter object or just the id
 * @param {string}                                  format  — format id
 */
export async function uploadPhotoStrip(photos, filter, format) {
    const filterCss = typeof filter === "object" ? filter.css : null;

    const formData = new FormData();

    // Apply CSS filter on canvas before uploading
    for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const filename = `photo-${i + 1}.jpg`;

        const filteredFile = filterCss
            ? await applyFilterToImage(photo.file, filterCss, filename)
            : photo.file;

        formData.append("photos", filteredFile, filename);
    }

    // Filter is already baked in — tell backend to skip it
    formData.append("FormatId", format);
    formData.append("filterId", "none");

    const response = await fetch(
        `${API_URL}/api/upload/generate`,
        {
            method: "POST",
            body: formData,
        }
    );

    const text = await response.text();
    if (!response.ok) {
        throw new Error(`Upload failed (${response.status}): ${text}`);
    }

    return JSON.parse(text);
}
