# HEIC Support — Full Change Log

## What is HEIC?

HEIC (High Efficiency Image Container) is the default photo format saved by iPhones and some
Windows cameras (like the Surface). The files end in `.heic` or `.heif`.

The problem: most browsers on Windows (Chrome, Edge) **cannot display or decode HEIC natively**.
They also don't know what MIME type to report for `.heic` files, so `file.type` comes back as
an empty string `""` instead of `"image/heic"`.

---

## What Was Broken Before

The app had 3 gates that a file passes through. All 3 blocked HEIC:

| Gate | File | What it checked | Result for HEIC |
|---|---|---|---|
| 1. Client validation | `useUpload.js` | `file.type` against an allowed list | ❌ Rejected — `file.type` was `""` |
| 2. Pre-upload processing | `upload.service.js` | `file.type` to decide if conversion needed | ❌ Skipped conversion — wrong type |
| 3. Server validation | `upload.middleware.js` | `file.mimetype` against an allowed list | ❌ Rejected by multer |

The file picker (`upload-page.jsx`) already had `image/heic` in its `accept` attribute,
so the file was selectable — but was immediately rejected at gate 1 before anything else ran.

---

## Overview of All Changes

```
NEW FILE   client/src/services/convertHeic.js       ← shared helper
MODIFIED   client/src/hooks/useUpload.js             ← preview fix + validation fix
MODIFIED   client/src/services/upload.service.js     ← uses shared helper
MODIFIED   server/middleware/upload.middleware.js     ← server safety net
```

---

## File 1 — NEW: `client/src/services/convertHeic.js`

This is a brand new file. It is the **single source of truth** for HEIC detection and conversion.
Both `useUpload.js` and `upload.service.js` import from here so the logic is never duplicated.

### Full file

```js
import heic2any from "heic2any";

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

export function isHeicFile(file) {
    const type = file.type || "";
    const ext  = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return type === "image/heic" || type === "image/heif"
        || ext  === ".heic"      || ext  === ".heif";
}
```

### What each export does

**`convertHeicToJpeg(file)`**
- Takes any `File` object
- Checks if it is HEIC by looking at **both** `file.type` AND the file extension
- Why both? Because Windows Chrome sets `file.type` to `""` for HEIC files — extension is the only reliable signal on Windows
- If it is HEIC: calls `heic2any` to convert it to a JPEG blob, wraps it back into a `File` with a `.jpg` name
- If it is NOT HEIC: returns the original file completely unchanged — zero cost
- `quality: 0.92` = 92% JPEG quality, same as the rest of the app

**`isHeicFile(file)`**
- A simple true/false check — "is this file HEIC?"
- Same dual check (MIME type + extension)
- Used by `useUpload.js` for validation

### Why `heic2any`?

`heic2any` was already in `package.json` before these changes. It is a browser-based library
that decodes HEIC entirely on the client — no server required. It uses WebAssembly under the hood.

---

## File 2 — MODIFIED: `client/src/hooks/useUpload.js`

This hook controls the upload flow: it validates files, builds the photo list, and generates the strip.

### Change 1 — New imports

```js
// BEFORE
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPhotoStrip } from "../services/upload.service";

// AFTER
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPhotoStrip } from "../services/upload.service";
import { convertHeicToJpeg, isHeicFile } from "../services/convertHeic"; // ← new
```

### Change 2 — ACCEPTED_TYPES + Windows MIME fallback

```js
// BEFORE
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// AFTER
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

// NEW helper function
function getEffectiveMimeType(file) {
  if (file.type) return file.type;       // normal browsers: use what browser reports
  if (isHeicFile(file)) return "image/heic"; // Windows fallback: check the extension
  return "";
}
```

**Why `getEffectiveMimeType`?**
On Windows, `file.type` is `""` for HEIC files. If we checked `file.type` directly against
`ACCEPTED_TYPES`, it would fail because `""` is not in the list. This function returns the
correct MIME type by falling back to the file extension.

### Change 3 — Validation uses the new helper

```js
// BEFORE
for (const file of incoming) {
  if (!ACCEPTED_TYPES.includes(file.type)) {  // ← always fails for HEIC on Windows
    setError(`"${file.name}" is not a supported image type (JPEG, PNG, WebP).`);
    return;
  }
}

// AFTER
for (const file of incoming) {
  const mimeType = getEffectiveMimeType(file);  // ← correctly identifies HEIC on Windows
  if (!ACCEPTED_TYPES.includes(mimeType)) {
    setError(`"${file.name}" is not a supported image type (JPEG, PNG, WebP, HEIC).`);
    return;
  }
}
```

### Change 4 — `createPhotoEntry` converts HEIC before making the preview

This is the most important change for the preview thumbnails.

```js
// BEFORE — synchronous function, no conversion
function createPhotoEntry(file) {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file); // ← HEIC blob, browser can't display it
    const img = new Image();
    img.onload = () => {
      resolve({
        file,        // ← stores the original HEIC file
        previewUrl,
        ...
      });
    };
    img.src = previewUrl;
  });
}

// AFTER — async function, converts first
async function createPhotoEntry(file) {
  const jpegFile = await convertHeicToJpeg(file); // ← HEIC becomes JPEG here

  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(jpegFile); // ← JPEG blob, browser can display it
    const img = new Image();
    img.onload = () => {
      resolve({
        file: jpegFile,   // ← stores the JPEG, not the original HEIC
        previewUrl,
        ...
      });
    };
    img.src = previewUrl;
  });
}
```

**Why store `jpegFile` instead of the original `file`?**
The `file` property on each photo entry is what gets uploaded later. If we stored the original
HEIC here, the upload would still need to convert it. By storing `jpegFile`, the conversion
happens exactly once — at preview time — and the upload just sends what's already there.

---

## File 3 — MODIFIED: `client/src/services/upload.service.js`

This service builds the `FormData` and sends it to the backend.

### Change 1 — Replaced inline logic with shared helper

```js
// BEFORE — heic2any imported directly, inline conversion function
import heic2any from "heic2any";

async function ensureJpeg(file) {
    const type = file.type || "";
    const ext  = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isHeic = type === "image/heic" || type === "image/heif"
                || ext === ".heic" || ext === ".heif";
    if (isHeic) {
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: "image/jpeg" });
    }
    return file;
}

// AFTER — imports from the shared helper instead
import { convertHeicToJpeg } from "./convertHeic.js";
// ensureJpeg is gone — convertHeicToJpeg does the same thing
```

### Change 2 — Upload loop uses shared helper

```js
// BEFORE
const filteredFile = filterCss
    ? await applyFilterToImage(photo.file, filterCss, filename)
    : photo.file;

// AFTER
const jpegFile = await convertHeicToJpeg(photo.file); // no-op if already JPEG

const filteredFile = filterCss
    ? await applyFilterToImage(jpegFile, filterCss, filename)
    : jpegFile;
```

**Note:** Because `createPhotoEntry` in `useUpload.js` already converts HEIC → JPEG and stores
the result as `photo.file`, by the time `uploadPhotoStrip` runs, `photo.file` is already a JPEG.
The `convertHeicToJpeg` call here is a **no-op** (returns immediately) in normal flow.
It is kept as a safety net for any code path that might pass an unconverted file.

---

## File 4 — MODIFIED: `server/middleware/upload.middleware.js`

This is the Express/multer middleware that validates files on the server before they are saved.

### Change

```js
// BEFORE
const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];
// error: "Only JPEG, PNG, and WEBP images are allowed"

// AFTER
const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",   // ← new
    "image/heif"    // ← new
];
// error: "Only JPEG, PNG, WEBP, and HEIC images are allowed"
```

**Why change this if conversion already happens on the client?**
In normal flow, the client converts HEIC → JPEG before uploading, so the server receives a JPEG
and never sees a HEIC file. But this is a safety net for:
- Direct API calls that bypass the frontend
- Browsers (like Safari on macOS) that can handle HEIC natively and might send it unconverted
- Any future code path that skips the client conversion

Sharp (the server-side image library) can process HEIC directly, so even if a HEIC file reaches
the server it will work fine.

---

## How Everything Connects

```
User picks a .heic file from the file picker
            │
            ▼
[useUpload.js — addPhotos()]
  getEffectiveMimeType(file)
    → file.type is "" on Windows
    → isHeicFile() checks extension → ".heic" → returns "image/heic"
  ACCEPTED_TYPES.includes("image/heic") → ✅ passes validation
            │
            ▼
[useUpload.js — createPhotoEntry()]
  convertHeicToJpeg(file)
    → detects HEIC by extension
    → heic2any converts HEIC blob → JPEG blob
    → returns new File("photo.jpg", type: "image/jpeg")
  URL.createObjectURL(jpegFile) → browser can display it ✅
  photo slot shows the preview image ✅
  stores { file: jpegFile, previewUrl }
            │
            ▼
User picks filter and clicks "Generate Strip"
            │
            ▼
[upload.service.js — uploadPhotoStrip()]
  convertHeicToJpeg(photo.file)
    → photo.file is already JPEG (converted at preview step)
    → isHeic is false → returns file unchanged (no-op) ✅
  applyFilterToImage(jpegFile, filterCss, filename)
    → draws JPEG on canvas with CSS filter
    → exports as JPEG blob ✅
  formData.append("photos", filteredFile, "photo-1.jpg")
            │
            ▼
fetch() → POST /api/upload/generate
            │
            ▼
[upload.middleware.js — multer fileFilter]
  file.mimetype is "image/jpeg" → allowedMimeTypes.includes → ✅
            │
            ▼
[image-processing.service.js — Sharp]
  sharp(file.path) → reads JPEG, composites strip → done ✅
```

---

## Summary Table

| File | What changed | Why |
|---|---|---|
| `convertHeic.js` | **Created** — shared HEIC detection + conversion helper | Single source of truth, reused by both client files |
| `useUpload.js` | Added `isHeicFile` import, `getEffectiveMimeType` helper, HEIC to `ACCEPTED_TYPES`, `createPhotoEntry` now async + converts before preview | Preview was broken; validation rejected HEIC on Windows |
| `upload.service.js` | Replaced inline `ensureJpeg` + `heic2any` import with `convertHeicToJpeg` from shared helper | Removes duplicate logic |
| `upload.middleware.js` | Added `image/heic` and `image/heif` to `allowedMimeTypes` | Server safety net |
