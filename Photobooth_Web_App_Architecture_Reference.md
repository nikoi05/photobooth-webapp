# Photobooth Web App – Architecture Reference

## Project Overview

### Goal
A hackathon-focused web-based photobooth application that allows users to:
- Capture photos using a webcam
- Apply filters before taking photos
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
- Camera access
- Live preview
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

# User Flow

```text
Landing
  ↓
Grant Camera Permission
  ↓
Choose Filter
  ↓
Live Preview
  ↓
Countdown
  ↓
Capture Photos
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
├── Camera
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

# Recommended Frontend Structure

```text
src/
├── components/
│   ├── camera/
│   ├── filters/
│   ├── countdown/
│   ├── photostrip/
│   ├── preview/
│   ├── share/
│   └── common/
├── hooks/
│   ├── useCamera.js
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
- Filters selected before capture
- Live filtered preview
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

## Pending Proposal

### Session ID

Introduce a frontend-only Session ID while keeping backend Share IDs independent.

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
