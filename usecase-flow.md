# Photobooth Web App – Architecture Reference

## Project Overview

### Goal
A hackathon-focused web-based photobooth application that allows users to:
- Choose a photo strip format
- Capture photos using a webcam OR upload existing photos
- Apply filters
- Generate a classic photo strip
- Download the final strip
- Share via QR code or download link
- Work responsively across desktop, tablet, and mobile

## Tech Stack

### Frontend
- Vite
- React
- Tailwind CSS

### Backend
- Node.js
- Express

### Database
- None (hackathon scope)

### Storage
- Temporary backend storage for final photo strips only.

---

# Approved Architecture (MAIN)

## Responsibilities

### Frontend
- Format selection
- Source selection (upload or camera)
- Camera access
- Live preview
- File upload & validation
- Filter selection
- Countdown
- Capture photos
- Compose photo strip
- Preview
- Download
- Request share link
- Display QR code

### Backend
- Receive final strip
- Generate share ID
- Temporarily store image
- Serve download endpoint
- Delete expired images

---

# User Flow (MAIN — Approved)

```text
Landing
  ↓
Choose Photo Format
  (determines requiredCount + aspect ratio/layout)
  ↓
Choose Source: Upload | Camera
  │
  ├── Upload
  │     ↓
  │   File Picker (multi-select)
  │     ↓
  │   Validate: files.length === requiredCount
  │     ↓
  │   Validate: file type/size per file
  │     ↓
  │   Preview grid of selected images
  │
  └── Camera
        ↓
      Grant Camera Permission
        ↓
      Live Preview
        ↓
      Loop until requiredCount reached:
        Countdown → Capture
  ↓
Apply Filters
  ↓
Generate Photo Strip
  ↓
Preview
  ├── Download
  └── Share
        ↓
 Upload Final Strip
        ↓
 Generate Share ID
        ↓
 Temporary Storage
        ↓
 QR Code / Download Link
```

---

# High-Level Architecture

```text
React Frontend
│
├── Format
├── Source (Upload | Camera)
├── Camera
├── Upload
├── Filters
├── Countdown
├── Photo Composer
├── Preview
├── Download
└── Share
      │
      ▼
Express Backend
│
├── Upload API
├── Share API
├── Temporary Storage
└── Cleanup Service
```

---

# Recommended Backend Structure

```text
server/
└── src/
    ├── app.js
    ├── server.js
    ├── routes/
    │   └── share.routes.js
    ├── controllers/
    │   └── share.controller.js
    ├── services/
    │   ├── storage.service.js
    │   └── cleanup.service.js
    ├── utils/
    │   └── idGenerator.js
    ├── storage/
    │   └── temp/
    └── config/
```

---

# Recommended Frontend Structure (MAIN)

```text
src/
├── components/
│   ├── format/
│   ├── camera/
│   ├── upload/
│   ├── filters/
│   ├── countdown/
│   ├── photostrip/
│   ├── preview/
│   ├── share/
│   └── common/
├── hooks/
│   ├── useCamera.js
│   ├── useUpload.js
│   └── usePhotoStrip.js
├── services/
│   └── shareService.js
├── pages/
│   └── Home.jsx
├── App.jsx
└── main.jsx
```

---

# API

## POST /api/share

Uploads the final photo strip.

### Response

```json
{
  "shareId": "Ab3X9QkP",
  "downloadUrl": "/share/Ab3X9QkP"
}
```

---

## GET /share/:shareId

Returns the stored image.

---

# Temporary Storage Lifecycle

```text
Upload
  ↓
Generate Share ID
  ↓
Store Image
  ↓
Serve Downloads
  ↓
Expiration
  ↓
Automatic Cleanup
```

---

# Current MAIN Decisions

- React + Vite frontend
- Tailwind CSS
- Node.js + Express backend
- Format selected before source (upload or camera)
- Upload supports multi-file selection matching format's required photo count
- Filters selected before strip generation
- Live filtered preview (camera flow)
- Classic photo strip generation
- Direct download
- QR code sharing
- Download link sharing
- Responsive design
- Temporary backend image storage
- No authentication
- No database

---

# STAGING

## Pending Proposal 1: Session ID

Introduce a frontend-only Session ID while keeping backend Share IDs independent.

Status: Pending

## Pending Proposal 2: Filter Scope

Apply one filter globally to all photos, or allow per-photo filtering?
- Camera flow captures one-by-one during the countdown loop, so per-photo filtering fits naturally.
- Upload flow lands all files at once, so global filtering is simpler to build.
- Recommendation for hackathon scope: global filter applied to all photos, revisit per-photo if time allows.

Status: Pending

---

# Guiding Principles

- Working demo over production readiness
- Modular architecture
- Clean separation of concerns
- Incremental improvements
- No architectural changes without approval
- MAIN contains approved decisions only
- STAGING contains proposals awaiting approval