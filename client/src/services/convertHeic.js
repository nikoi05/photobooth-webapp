import heic2any from "heic2any";

/**
 * convertHeicToJpeg
 *
 * Converts a HEIC/HEIF File to a JPEG File.
 * If the file is already JPEG, PNG, or WebP it is returned unchanged.
 *
 * Handles the Windows Chrome/Edge quirk where HEIC files report an empty
 * MIME type string — falls back to checking the file extension.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function convertHeicToJpeg(file) {
    const type = file.type || "";
    const ext  = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isHeic = type === "image/heic" || type === "image/heif"
                || ext  === ".heic"       || ext  === ".heif";

    if (!isHeic) return file;

    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], jpegName, { type: "image/jpeg" });
}

/**
 * isHeicFile
 *
 * Returns true if the file is HEIC/HEIF, checking both MIME type and
 * extension (needed for Windows where MIME type may be empty).
 *
 * @param {File} file
 * @returns {boolean}
 */
export function isHeicFile(file) {
    const type = file.type || "";
    const ext  = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return type === "image/heic" || type === "image/heif"
        || ext  === ".heic"      || ext  === ".heif";
}
