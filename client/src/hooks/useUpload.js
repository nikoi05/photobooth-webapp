/**
 * useUpload
 *
 * Manages the upload flow state.
 *
 * Each photo entry shape:
 *   {
 *     file,
 *     previewUrl,
 *     width,        — natural image width in px
 *     height,       — natural image height in px
 *     aspectRatio,  — width / height
 *     orientation,  — "portrait" | "landscape" | "square"
 *     crop: {       — initial crop config for future crop editor
 *       x: 0.5,
 *       y: 0.5,
 *       zoom: 1,
 *     }
 *   }
 *
 * Exported API (unchanged):
 *   { photos, error, isFull, addPhotos, removePhoto, clearPhotos }
 *
 * Validation rules (per file):
 *   - Must be image/jpeg, image/png, or image/webp
 *   - Must be ≤ 25 MB
 *   - Total count must not exceed requiredCount
 */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPhotoStrip } from "../services/upload.service";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

/* ─────────────────────────────────────────────────────────────────
   createPhotoEntry
   Async — creates a preview URL, loads the image to read its natural
   dimensions, computes metadata, and returns the enriched entry.
   Revokes the preview URL and rejects if the image fails to load.
───────────────────────────────────────────────────────────────── */
function createPhotoEntry(file) {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
      const width       = img.naturalWidth;
      const height      = img.naturalHeight;
      const aspectRatio = width / height;

      const orientation =
        aspectRatio > 1.05 ? "landscape" :
        aspectRatio < 0.95 ? "portrait"  :
        "square";

      resolve({
        file,
        previewUrl,
        width,
        height,
        aspectRatio,
        orientation,
        // Initial crop config — reserved for future crop editor
        crop: { x: 0.5, y: 0.5, zoom: 1 },
      });
    };

    img.onerror = () => {
      // Clean up the URL so we don't leak memory on failure
      URL.revokeObjectURL(previewUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = previewUrl;
  });
}

/* ─────────────────────────────────────────────────────────────────
   useUpload
───────────────────────────────────────────────────────────────── */
export function useUpload(requiredCount = 4) {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [error,  setError]  = useState(null);

  const addPhotos = useCallback(
    async (files) => {
      setError(null);
      const incoming = Array.from(files);

      // ── Validation ──────────────────────────────────────────
      for (const file of incoming) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`"${file.name}" is not a supported image type (JPEG, PNG, WebP).`);
          return;
        }
        if (file.size > MAX_SIZE_BYTES) {
          setError(`"${file.name}" exceeds the 25 MB size limit.`);
          return;
        }
      }

      // ── Slot check ──────────────────────────────────────────
      // Read current length outside setPhotos so we can slice before the async work
      setPhotos((prev) => {
        const remaining = requiredCount - prev.length;

        if (remaining <= 0) {
          setError(
            `You already have ${requiredCount} photo${requiredCount !== 1 ? "s" : ""}. Remove one to add another.`
          );
          return prev;
        }

        const accepted = incoming.slice(0, remaining);

        if (incoming.length > remaining) {
          setError(
            `Only ${remaining} slot${remaining !== 1 ? "s" : ""} left. Extra files were ignored.`
          );
        }

        // Kick off async metadata extraction outside the updater
        Promise.all(
          accepted.map((file) =>
            createPhotoEntry(file).catch((err) => {
              // One bad image: report error but skip it rather than crashing
              setError(`Could not read "${file.name}". Try a different image.`);
              console.warn(err);
              return null;
            })
          )
        ).then((results) => {
          const valid = results.filter(Boolean);
          if (valid.length > 0) {
            setPhotos((current) => [...current, ...valid]);
          }
        });

        // Return prev unchanged — setPhotos above handles the real update
        return prev;
      });
    },
    [requiredCount]
  );

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => {
      const entry = prev[index];
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setError(null);
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
      return [];
    });
    setError(null);
  }, []);

  const Generate = async (data) => {
  
  const filter = data.filter.id;
  const format = data.format.id;
   try {
      const response = await uploadPhotoStrip(photos,filter,format);
      if (response.success) {
        navigate("/preview");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return {
    photos,
    error,
    isFull: photos.length === requiredCount,
    addPhotos,
    removePhoto,
    clearPhotos,
    Generate,
  };
}
