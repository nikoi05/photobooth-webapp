# Full Photo Pipeline — Camera & Upload

This document explains the complete journey of a photo from the moment it is taken or selected,
all the way to the final generated strip.

---

## Two Entry Points

The app has two ways to get photos in. They follow the same 3-step flow (Format → Photos → Filter)
but diverge in how photos are obtained.

```
User lands on /start
        │
        ├── "Use Camera"  → camera-page.jsx
        └── "Upload"      → upload-page.jsx
```

---

## Path A — Camera

### Files involved
- `client/src/pages/camera-page.jsx`
- `client/src/hooks/useCamera.js`

### Step 1 — Format pick
User picks how many photos go in the strip (2, 3, or 4).
Stored in local state as `format`.

### Step 2 — Capture

**`useCamera.js` starts the webcam:**
```
navigator.mediaDevices.getUserMedia({ video: true })
  → stream assigned to <video> element
  → live feed shows in the viewfinder
```

User presses Start. A countdown loop begins (3… 2… 1… flash) and repeats
until `requiredCount` photos are captured.

**`capturePhoto()` in `useCamera.js`:**
```
video frame
  → drawn onto a canvas (with horizontal flip if mirror is on)
  → canvas.toDataURL("image/jpeg", 0.92)
  → converted to Blob → File("capture-timestamp.jpg")
  → stored as { dataUrl, blob, file }
```

Key point: camera photos are **already JPEG** from the canvas — no HEIC involved,
no EXIF orientation issue (the canvas bakes in the correct orientation at capture time).

Each captured photo gets added to the `photos` array with a `previewUrl` for the thumbnails.

### Step 3 — Filter pick
User sees `FilterPicker`. Each filter is a CSS filter string, e.g.:
```
"grayscale(1) contrast(1.5) brightness(0.88)"   // Noir
"sepia(0.5) saturate(1.3) brightness(1.08)"      // Sandali
```
The selected filter is applied live to the preview thumbnails via the CSS `filter` property.
Nothing is re-encoded yet — it's purely visual at this stage.

### Generate
User clicks "Generate Strip →". Goes to `handleGenerate()` in `camera-page.jsx`,
which calls `uploadPhotoStrip()` in `upload.service.js`.

---

## Path B — Upload

### Files involved
- `client/src/pages/upload-page.jsx`
- `client/src/hooks/useUpload.js`
- `client/src/services/convertHeic.js`

### Step 1 — Format pick
Same as camera — user picks strip format.

### Step 2 — File pick

`upload-page.jsx` has a hidden `<input type="file">`:
```html
<input type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple />
```

When files are selected, `addPhotos()` in `useUpload.js` runs.

#### Validation (useUpload.js)
```
for each file:
  1. getEffectiveMimeType(file)
       → if file.type is not empty → use it directly
       → if file.type is "" (Windows Chrome HEIC quirk) → check file extension
  2. check mime is in ACCEPTED_TYPES ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]
       → if not → show error, stop
  3. check file.size ≤ 25MB
       → if not → show error, stop
```

#### createPhotoEntry (useUpload.js)
For each valid file, `createPhotoEntry()` runs:

```
file (could be HEIC, JPEG, PNG, WebP)
  │
  ▼
convertHeicToJpeg(file)        ← convertHeic.js
  │  Step 1: is it HEIC?
  │    YES (Windows .heic with empty type, or explicit image/heic)
  │      → heic2any converts HEIC blob → JPEG blob
  │      → wrapped into new File("photo.jpg", "image/jpeg")
  │    NO → pass through unchanged
  │
  │  Step 2: fix EXIF orientation
  │    → readExifOrientation() reads raw JPEG bytes
  │        checks JPEG SOI marker (0xFFD8)
  │        finds APP1 block (0xFFE1) which holds EXIF data
  │        reads TIFF header byte order (little or big endian)
  │        scans IFD0 entries for tag 0x0112 (Orientation)
  │        returns orientation value 1–8
  │    → if orientation === 1 → already correct, return file as-is
  │    → if orientation !== 1:
  │        draws image onto canvas with the correcting rotation:
  │          3 → 180°
  │          6 → 90° CW  (most iPhone portrait shots)
  │          8 → 90° CCW
  │        canvas.toBlob() → new File with rotation baked into pixels
  │
  ▼
jpegFile  (clean JPEG, correct orientation)
  │
  ▼
URL.createObjectURL(jpegFile)  → previewUrl
  │
  ▼
<img src={previewUrl} />       → photo slot thumbnail shown to user
  │
  stored as { file: jpegFile, previewUrl, width, height, ... }
```

Why orientation matters: iPhone stores photo pixels rotated sideways and uses the EXIF tag
to tell viewers "rotate this when displaying". `<img>` respects that tag so previews look right,
but `canvas.drawImage()` ignores it — so without fixing it, the uploaded strip comes out rotated.

### Step 3 — Filter pick
Same as camera — CSS filter string selected, applied live to thumbnails via CSS.

---

## Shared Path — From Generate to Server

Both camera and upload end up calling the same function:

```
uploadPhotoStrip(photos, filter, format)     ← upload.service.js
```

### Inside uploadPhotoStrip (upload.service.js)

```
for each photo:
  │
  ├─ convertHeicToJpeg(photo.file)           ← convertHeic.js
  │    For upload path: photo.file is already a clean JPEG from createPhotoEntry
  │    so this is a no-op (passes through immediately).
  │    For camera path: photo.file is already JPEG from canvas capture,
  │    no EXIF rotation issue, also a no-op.
  │    Kept as a safety net for any edge case.
  │
  ├─ applyFilterToImage(jpegFile, filterCss, filename)   ← applyFilterToImage.js
  │    Only runs if a filter other than "none" is selected.
  │
  │    draws jpegFile onto canvas with ctx.filter = filterCss
  │      → filter is baked into the pixels
  │    canvas.toBlob("image/jpeg", 0.92)
  │      → new File("photo-1.jpg", "image/jpeg")
  │
  │    If filter is "none" → returns jpegFile unchanged
  │
  └─ formData.append("photos", filteredFile, "photo-N.jpg")

formData also includes:
  FormatId = "strip-2" | "strip-3" | "strip-4"
  filterId = "none"    (filter is already baked in by applyFilterToImage)

fetch POST /api/upload/generate
```

### Why is `filterId` always "none" sent to the server?

Because the filter is applied on the client canvas before upload. This guarantees the server
output looks exactly like what the user saw in the browser preview. The server receives
plain JPEGs and just composites them onto the strip template.

---

## Server Side (summary)

```
POST /api/upload/generate
  │
  ▼
upload.middleware.js (multer)
  → checks MIME type: jpeg / png / webp / heic / heif allowed
  → checks file size ≤ 25MB
  → saves to uploads/ folder on disk
  │
  ▼
upload.controller.js
  → calls processImage(req.files, FormatId, filterId)
  │
  ▼
image-processing.service.js (Sharp)
  → loads each file with sharp(file.path)
  → picks layout based on FormatId (strip-2 / strip-3 / strip-4)
  → applyFilter() — receives "none" so passes through
  → resizes each photo to fit its slot in the layout
  → composites photos onto the strip PNG template
  → outputs as JPEG buffer
  │
  ▼
StorageService.js
  → uploads buffer to Supabase storage at outputs/uuid.jpg
  │
  ▼
share.service.js
  → creates a share record in the database
  → returns shareID + expiresAt
  │
  ▼
response: { success: true, shareID, imageUrl, filename }
  │
  ▼
client navigates to /share/:shareID
```

---

## Full Flow Diagram

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│        CAMERA PATH          │    │        UPLOAD PATH          │
│                             │    │                             │
│  useCamera.js               │    │  upload-page.jsx            │
│  getUserMedia → live feed   │    │  <input type="file">        │
│                             │    │                             │
│  capturePhoto()             │    │  useUpload.js               │
│  video frame → canvas       │    │  validate MIME + size       │
│  → JPEG File (no EXIF)      │    │                             │
│                             │    │  convertHeic.js             │
│                             │    │  HEIC → JPEG  (if needed)   │
│                             │    │  fix EXIF orientation       │
│                             │    │  → clean JPEG File          │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                   │
               └──────────────┬────────────────────┘
                              │
                              ▼
                    FilterPicker.jsx
                    user picks CSS filter
                    (live preview via CSS, no re-encoding yet)
                              │
                              ▼
                    upload.service.js
                    uploadPhotoStrip()
                              │
                    for each photo:
                    convertHeicToJpeg()  ← no-op at this point
                    applyFilterToImage() ← bakes filter onto canvas
                    → final JPEG File
                              │
                    FormData assembled
                    fetch POST /api/upload/generate
                              │
                              ▼
                    upload.middleware.js
                    multer validates + saves to disk
                              │
                              ▼
                    image-processing.service.js
                    Sharp composites photos onto strip template
                              │
                              ▼
                    StorageService.js → Supabase
                    share.service.js  → DB record
                              │
                              ▼
                    /share/:shareID
```

---

## File Reference

| File | Role |
|---|---|
| `pages/camera-page.jsx` | Camera UI, step flow, calls `useCamera` and `uploadPhotoStrip` |
| `pages/upload-page.jsx` | Upload UI, step flow, hidden file input |
| `hooks/useCamera.js` | Webcam access, capture, mirror, device switching |
| `hooks/useUpload.js` | File validation, calls `createPhotoEntry`, manages photo state |
| `services/convertHeic.js` | HEIC detection, heic2any conversion, EXIF orientation correction |
| `services/upload.service.js` | Assembles FormData, calls `applyFilterToImage`, sends fetch |
| `services/applyFilterToImage.js` | Draws photo on canvas with CSS filter, returns JPEG |
| `components/common/FilterPicker.jsx` | Filter selector UI, defines all filter CSS strings |
| `server/middleware/upload.middleware.js` | Multer — validates MIME type and file size |
| `server/controller/upload.controller.js` | Receives files, calls `processImage` |
| `server/services/image-processing.service.js` | Sharp — composites photos onto strip template |
| `server/services/StorageService.js` | Uploads final strip to Supabase |
| `server/services/share.service.js` | Creates share record in database |
