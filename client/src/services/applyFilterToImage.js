/**
 * applyFilterToImage
 *
 * Draws a photo onto a canvas with a CSS filter applied, then returns
 * a File containing the filtered image as a JPEG.
 *
 * This guarantees the uploaded image looks exactly like the browser preview —
 * no server-side approximation needed.
 *
 * @param {File|Blob} file       — original image file
 * @param {string}    filterCss  — CSS filter string e.g. "sepia(0.5) saturate(1.3)"
 * @param {string}    filename   — output filename
 * @returns {Promise<File>}
 */
export async function applyFilterToImage(file, filterCss, filename) {
  // "none" or empty — return the original file unchanged
  if (!filterCss || filterCss === "none") return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      // Apply the CSS filter — the browser renders it exactly as the preview
      ctx.filter = filterCss;
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

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
