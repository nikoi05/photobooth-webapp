import heic2any from "heic2any";

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

/**
 * readExifOrientation
 *
 * Reads the EXIF orientation tag from a JPEG file's raw bytes.
 * Returns a number 1–8 (1 = normal, no rotation needed).
 * Returns 1 if the tag is missing or unreadable.
 *
 * iPhone photos are almost always orientation 6 (90° CW) or 3 (180°).
 * Canvas ignores EXIF, so without this correction uploads come out rotated.
 *
 * @param {File} file
 * @returns {Promise<number>}
 */
async function readExifOrientation(file) {
    try {
        // Read first 64KB — enough to find the EXIF block
        const buffer = await file.slice(0, 65536).arrayBuffer();
        const view   = new DataView(buffer);

        // Must start with JPEG SOI marker 0xFFD8
        if (view.getUint16(0) !== 0xFFD8) return 1;

        let offset = 2;

        while (offset < view.byteLength - 2) {
            const marker = view.getUint16(offset);
            offset += 2;

            // APP1 marker (0xFFE1) contains EXIF data
            if (marker === 0xFFE1) {
                const segmentLength = view.getUint16(offset);

                // Check for "Exif\0\0" header
                if (view.getUint32(offset + 2) !== 0x45786966) return 1; // "Exif"

                const tiffOffset = offset + 8; // skip segment length (2) + "Exif\0\0" (6)

                // Determine byte order: "II" = little-endian, "MM" = big-endian
                const byteOrder = view.getUint16(tiffOffset);
                const littleEndian = byteOrder === 0x4949;

                // IFD0 starts at tiffOffset + IFD offset (at byte 4 of TIFF header)
                const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian);
                const ifdStart  = tiffOffset + ifdOffset;
                const numEntries = view.getUint16(ifdStart, littleEndian);

                for (let i = 0; i < numEntries; i++) {
                    const entryOffset = ifdStart + 2 + i * 12;
                    const tag = view.getUint16(entryOffset, littleEndian);

                    // Tag 0x0112 = Orientation
                    if (tag === 0x0112) {
                        return view.getUint16(entryOffset + 8, littleEndian);
                    }
                }
                return 1;
            }

            // Skip non-APP1 segments
            if (marker === 0xFFDA) break; // SOS marker — no more metadata
            offset += view.getUint16(offset);
        }
    } catch {
        // Ignore any parse errors — treat as no rotation
    }
    return 1;
}

/**
 * fixOrientation
 *
 * Redraws an image onto a canvas with EXIF orientation corrected,
 * then returns a new JPEG File with the rotation baked in.
 *
 * Orientation values:
 *   1 = normal (no-op)
 *   3 = 180°
 *   6 = 90° clockwise  (most common iPhone portrait photo)
 *   8 = 90° counter-clockwise
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
async function fixOrientation(file) {
    const orientation = await readExifOrientation(file);

    // Orientation 1 = already correct — return unchanged to avoid unnecessary re-encoding
    if (orientation === 1) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const { naturalWidth: w, naturalHeight: h } = img;

            const canvas = document.createElement("canvas");
            const ctx    = canvas.getContext("2d");

            // For 90°/270° rotations the canvas dimensions need to swap
            if (orientation === 6 || orientation === 8) {
                canvas.width  = h;
                canvas.height = w;
            } else {
                canvas.width  = w;
                canvas.height = h;
            }

            // Apply the transform that corrects the rotation
            switch (orientation) {
                case 3: // 180°
                    ctx.translate(w, h);
                    ctx.rotate(Math.PI);
                    break;
                case 6: // 90° CW
                    ctx.translate(h, 0);
                    ctx.rotate(Math.PI / 2);
                    break;
                case 8: // 90° CCW
                    ctx.translate(0, w);
                    ctx.rotate(-Math.PI / 2);
                    break;
                default:
                    break;
            }

            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Canvas toBlob failed during orientation fix"));
                    resolve(new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.92
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load image for orientation fix: ${file.name}`));
        };

        img.src = url;
    });
}

/**
 * convertHeicToJpeg
 *
 * Converts a HEIC/HEIF File to a JPEG File, then fixes EXIF orientation.
 * If the file is already JPEG/PNG/WebP, skips conversion but still fixes orientation.
 *
 * Handles the Windows Chrome/Edge quirk where HEIC files report an empty
 * MIME type string — falls back to checking the file extension.
 *
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function convertHeicToJpeg(file) {
    let jpegFile = file;

    // Step 1 — convert HEIC → JPEG if needed
    const type = file.type || "";
    const ext  = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isHeic = type === "image/heic" || type === "image/heif"
                || ext  === ".heic"       || ext  === ".heif";

    if (isHeic) {
        const blob    = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
        jpegFile = new File([blob], jpegName, { type: "image/jpeg" });
    }

    // Step 2 — fix EXIF orientation (common on iPhone photos)
    // iOS auto-converts HEIC → JPEG but keeps the EXIF rotation tag.
    // Canvas ignores EXIF so without this step uploads come out rotated.
    jpegFile = await fixOrientation(jpegFile);

    return jpegFile;
}
