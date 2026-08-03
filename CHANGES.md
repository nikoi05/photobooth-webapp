# Changelog

## Bug Fixes — Share Function (2026-08-01)

### 1. Null crash in `preview-page.jsx`

**File:** `client/src/pages/preview-page.jsx`

**Problem:**  
`strip` state was initialised as `null`. The component tried to access `strip.imageUrl` during the very first render — before the `fetch` call to `/api/share/:shareId` had resolved — causing a `TypeError: Cannot read properties of null`.

**Fix:**
- Added a `loading` state (default `true`) alongside the existing `strip` state.
- Wrapped `loadStrip` in a `try/catch/finally` block; `setLoading(false)` is called in `finally` so it fires whether the fetch succeeds or fails.
- Added two early-return guards before the main JSX:
  - While `loading` is `true` → renders a "Loading your strip…" message.
  - After loading, if `strip` is still `null` (fetch failed or share not found) → renders a "Strip not found or has expired." message.
- Moved all `useState` declarations to the top of the component for consistency.

---

### 2. Missing `imageUrl` in server upload response

**File:** `server/services/image-processing.service.js`

**Problem:**  
`useUpload.js` navigates to the preview page and passes `response.data.imageUrl` via React Router `state`. However, `processImage` did not include `imageUrl` in its return value, so `response.data.imageUrl` was always `undefined` on the client.

**Fix:**  
Added `imageUrl: \`/output/${filename}\`` to the object returned by `processImage`, so the client receives the URL immediately in the upload response and can pass it through navigation state.

```js
// Before
return {
    success: true,
    message: "Image processed successfully",
    filename: filename,
    shareID: share.shareID,
    expiresAt: share.expiresAt
};

// After
return {
    success: true,
    message: "Image processed successfully",
    filename: filename,
    shareID: share.shareID,
    expiresAt: share.expiresAt,
    imageUrl: `/output/${filename}`   // ← added
};
```

---

### Files Changed

| File | Change |
|------|--------|
| `client/src/pages/preview-page.jsx` | Added `loading` state, `try/catch/finally` on fetch, early-return null/loading guards |
| `server/services/image-processing.service.js` | Added `imageUrl` field to `processImage` return value |


### 3. `handleDownload` not defined in `preview-page.jsx`

**File:** `client/src/pages/preview-page.jsx`

**Problem:**  
The "Download Strip" button called `handleDownload` but the function was never defined, causing a `ReferenceError` at runtime.

**Fix:**  
Added `handleDownload` — fetches the image from the server as a blob, creates a temporary object URL, triggers a native browser download with the strip's filename, then revokes the URL to free memory.



---

## New Feature — Share Button (2026-08-01)

### Share functionality in `preview-page.jsx`

**File:** `client/src/pages/preview-page.jsx`

**Feature:**  
Added a "Share" button that allows users to share their photo strip via:
1. **Native share API** (on mobile) — opens the system share sheet
2. **Clipboard copy** (desktop fallback) — copies the shareable URL and shows "✓ Link copied!" feedback for 2 seconds

**Implementation:**
- Added `copyFeedback` state to track when the URL has been copied
- `handleShare()` function:
  - Constructs the shareable URL using `window.location.origin` + `/share/${shareId}`
  - Attempts `navigator.share()` first for native mobile sharing
  - Falls back to `navigator.clipboard.writeText()` with visual feedback
- Share button placed between "Download" and "start over" in the actions section
- Button text toggles between "Share →" and "✓ Link copied!" based on `copyFeedback` state
