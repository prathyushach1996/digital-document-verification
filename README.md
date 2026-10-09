# DocuTrust — MERN Stack Digital Document Verification & QR Authentication Platform

> **A modern, full-stack MERN application for issuing, managing, cryptographically securing (SHA-256), and verifying digital credentials via Unique Document IDs and QR Codes.**

---

## 🌟 Key Features

### 1. 🔍 Instant Document Verification (Public / Verifier Portal)
- **Document ID Search:** Instant lookup with bit-for-bit cryptographic authenticity check.
- **QR Code Scanning:**
  - **Upload QR Image:** Drop or browse any credential image / screenshot.
  - **Live Webcam Scanner:** Point webcam or smartphone camera at any QR code to authenticate in real-time.
- **Tamper Detection Engine:** Recalculates the SHA-256 checksum over the document's canonical fields and flags any post-issuance tampering (`INTEGRITY BREACH / TAMPER DETECTED`).
- **Status Checks:** Automatically handles `VALID`, `REVOKED`, `EXPIRED`, and `PENDING` credentials.
- **Celebration Confetti:** Interactive celebratory confetti on authentic verification!

### 2. 📋 Issuer Management Desk (Full CRUD Operations)
- **Issue Digital Documents:** Create credentials with title, category, holder details, identifier, and custom key-value metadata attributes.
- **Automated Digital Signing:** Computes deterministic SHA-256 fingerprint and generates a scannable high-resolution QR code embedding the verification route.
- **Edit & Re-sign:** Modify particulars with automatic cryptographic re-sealing.
- **Revocation & Status Manager:** Revoke credentials with an official justification reason recorded for auditors.
- **Record Deletion:** Permanently purge records with automatic cascading log cleanup.
- **Search & Filters:** Search by ID, holder, or title; filter by status and category.

### 3. 🎓 Holder Credential Vault
- **Self-Sovereign Credential Wallet:** View all documents issued to the holder.
- **High-Contrast QR Presentation:** One-click full-screen display for presenting credentials to employers, airports, or inspectors.
- **Printable Certificate:** High-resolution official certificate diploma view with gold seal, signature, and verifiable QR stamp.

### 4. 📊 Audit Trail & Telemetry
- **Immutable Verification Logs:** Every verification attempt is logged in MongoDB with timestamp, verifier name, method (`qr_scan`, `id_lookup`, `camera_live_scan`), status, and IP address.
- **Category Analytics:** Visual distribution charts across Academic, Medical, Legal, Identity, and Employment credentials.

### 5. ⚡ Tamper-Proof Testing Lab
- **Interactive Security Sandbox:** Allows judges and evaluators to intentionally tamper with a record in the database without re-signing the cryptographic hash.
- **Live Proof:** Demonstrates the system immediately detecting hash mismatch between the recorded issuer fingerprint and the recalculation.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, html5-qrcode, canvas-confetti, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js (REST API, Modular MVC Architecture, JWT Auth, CORS, Morgan) |
| **Database** | MongoDB (Mongoose ODM, Schema validation, Indexes, Aggregations) |
| **Security & Crypto** | Node `crypto` (SHA-256 Digital Fingerprinting), `bcryptjs`, `jsonwebtoken` (JWT) |
| **QR Engine** | `qrcode` (High-resolution Data URL generation) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running on `mongodb://127.0.0.1:27017`)

### 1. Backend Setup
```bash
cd backend
npm install
node src/seed.js    # Populates MongoDB with demo users & verified documents
npm start           # Starts API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Starts React app on http://localhost:5173
```

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Issuer / Admin** | `issuer@verify.org` | `password123` | Full CRUD, Issue, Revoke, Edit documents |
| **Verifier / Auditor** | `verifier@company.com` | `password123` | Audit logs, inspection & verification |
| **Document Holder** | `holder@citizen.org` | `password123` | Holder vault, display QR, view certificate |

*Tip: You can switch between any of these accounts with 1 click using the **"Switch Role"** button in the navbar!*

---

## 📄 Seeded Sample Records (For Testing)

| Document ID | Type | Holder | Status | Test Note |
| :--- | :--- | :--- | :--- | :--- |
| `DOC-2026-CS8821` | Academic Degree | Alexander Wright | **VALID** | Genuine, shows confetti & full certificate |
| `DOC-2026-MED4409` | Medical License | Dr. Sophia Ramirez | **VALID** | Genuine medical practitioner credential |
| `DOC-2026-LAW3321` | Property Deed | Elena Rostova | **REVOKED** | Shows court revocation justification |
| `DOC-2026-EXP7712` | Security Clearance | David Miller | **EXPIRED** | Past expiration date warning |

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/documents/verify` | Public | **Verify document by ID or QR scan payload** |
| `GET` | `/api/documents` | Public / Auth | List all documents with search & filter |
| `POST` | `/api/documents` | Issuer | Create & sign new document with QR |
| `GET` | `/api/documents/:id` | Public | Fetch single document details |
| `PUT` | `/api/documents/:id` | Issuer | Update document particulars & re-sign |
| `PATCH` | `/api/documents/:id/status`| Issuer | Update status (`VALID`, `REVOKED`, etc.) |
| `DELETE`| `/api/documents/:id` | Issuer | Delete document record |
| `GET` | `/api/analytics/summary` | Public | Fetch system metrics & audit feed |
| `POST` | `/api/documents/:id/tamper-demo` | Testing | Artificially tamper with data for demo |
