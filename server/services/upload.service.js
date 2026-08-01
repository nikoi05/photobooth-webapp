/**
 * Upload Service (placeholder)
 * Handles business logic for photo upload processing.
 * Replace the stub implementations with real logic (e.g. sharp processing, S3 upload).
 */

/**
 * Process an uploaded photo strip.
 * @param {Express.Multer.File} file - The uploaded file object from multer.
 * @returns {Promise<{ fileId: string, filename: string, mimetype: string, size: number, url: string }>}
 */
export async function processUpload(file) {
  // TODO: run image processing (sharp), generate photo strip, upload to storage, etc.
  return {
    fileId: file.filename.split(".")[0],
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    // Placeholder URL — replace with real CDN/S3 URL after storage integration
    url: `/uploads/${file.filename}`,
  };
}
