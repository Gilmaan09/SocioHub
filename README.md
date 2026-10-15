# 🏘️ SocioHub – Society Management Platform

A full-stack application for managing the everyday operations of a residential society. SocioHub gives administrators, residents, and watchmen dedicated workspaces for society operations, maintenance, community updates, and visitor handling.

---

## 🚀 Features

### 🏢 Society Administration

- Register a society and its first administrator account.
- Manage society details, wings, flats, parking, residents, and watchmen.
- Assign residents to flats with safeguards against accidental replacement.
- Create maintenance bills and review payment history.
- Track the society opening balance, income, expenses, fund balance, and transactions.
- Review complaints and publish announcements.
- View reports for maintenance, income and expenses, complaints, and watchman attendance.
- Manage the administrator profile and password.

### 🏠 Resident & Tenant Workspace

- View dashboard, assigned flat, parking, and society information.
- Read society amenities and internal features.
- View maintenance bills and payment history; print or save bills and receipts as PDF through the browser print dialog.
- Submit and follow up on complaints.
- Read announcements and notifications.
- Join wing and society discussions.
- View visitors registered for the resident's flat and approve or reject requests.
- View the society watchman directory and manage profile details.

Owners and tenants currently share the same resident features, with role information shown where applicable.

### 🛡️ Watchman Workspace

- Register visitors for flats in the watchman's society.
- Review visitor requests and record entry and exit activity.
- Start and end duty shifts and view attendance history.
- Look up flats needed for visitor registration.

The administrator workspace does not include a visitor log. Visitor handling is available to watchmen and residents.

### 🔐 Roles & Data Access

- **Admin:** Society setup, resident and watchman management, maintenance, finance, complaints, announcements, reports, and attendance review.
- **Owner:** Resident workspace, assigned flat and visitor approvals, bills, complaints, community, and announcements.
- **Tenant:** Resident workspace, assigned flat and visitor approvals, bills, complaints, community, and announcements.
- **Watchman:** Visitor operations, flat lookup for visitor registration, own attendance, and profile.

The backend enforces role permissions and scopes records to the authenticated user's society. Resident bill, complaint, and visitor operations are scoped to the resident's assigned flat where applicable.

---

## 🛠️ Tech Stack

### Frontend

- React 19
- React Router
- Vite

### Backend

- Node.js
- Express 5
- Mongoose

### Database & Authentication

- MongoDB
- JSON Web Tokens (JWT)
- bcryptjs password hashing
- dotenv and CORS

---

## 📁 Project Structure

```text
SocioHub/
├── backend/
│   └── src/
│       ├── config/       # Database connection
│       ├── controllers/  # HTTP request handlers
│       ├── middleware/   # Authentication and role checks
│       ├── models/       # Mongoose models
│       ├── routes/       # REST API routes
│       ├── services/     # Application logic
│       └── utils/
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── layouts/
        ├── pages/
        └── services/     # Frontend API client
```

---

## ⚡ How to Run Locally

### Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone https://github.com/Gilmaan09/SocioHub.git
cd SocioHub
```

### 2. Configure the backend

Create `backend/.env`:

```dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/sociohub
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Install dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default. Verify it at `http://localhost:4000/api/health`.

### 3. Configure and start the frontend

In another terminal, from the repository root, create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

Then install dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

### 4. Create your society

Choose **Create account** on the sign-in page to register a society and its first administrator. The administrator can then configure wings, flats, residents, and watchmen.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `4000`. |
| `MONGODB_URI` | MongoDB connection string; defaults to the local `sociohub` database. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens; set a strong, unique value. |
| `JWT_EXPIRES_IN` | Token lifetime; defaults to `7d`. |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins; local Vite origins are used if unset. |

For Atlas, use the connection string from your cluster and keep it private. Environment files are excluded from Git. Never commit database credentials or JWT secrets. Frontend variables beginning with `VITE_` are bundled into the browser and must not contain secrets.

---

## 🔌 API Overview

The Express API is mounted under `/api`.

| Endpoint | Purpose |
| --- | --- |
| `/api/auth` | Society registration, sign-in, current user, profile, and password change. |
| `/api/societies` | Society details. |
| `/api/wings`, `/api/flats`, `/api/parking` | Society structure and parking assignments. |
| `/api/residents`, `/api/watchmen` | Resident and watchman account management. |
| `/api/bills` | Maintenance bills, payment records, and receipts. |
| `/api/finance` | Opening balance, income, expenses, transactions, and fund summary. |
| `/api/complaints` | Resident complaints and admin management. |
| `/api/announcements` | Admin publishing and resident announcement feed. |
| `/api/community` | Society and wing discussions. |
| `/api/visitors` | Watchman visitor registration and resident approval. |
| `/api/watchman-attendance` | Watchman duty records and admin attendance views. |
| `/api/notifications` | Notification inbox and read status. |
| `/api/reports` | Society reports for administrators. |
| `/api/health` | API health check. |

---

## ✅ Project Checks

From the `frontend/` directory:

```bash
npm run lint
npm run build
```

The backend currently provides development and production start scripts but does not define an automated test script.

---

## 🚀 Production Notes

- Set `VITE_API_URL` and `CORS_ORIGIN` to the deployed frontend and backend origins. `localhost` only refers to the machine making the request.
- Store `MONGODB_URI` and `JWT_SECRET` as backend deployment secrets. Restrict database network access to the backend where possible.
- Maintenance checkout currently uses a development-only demo payment. The backend blocks this mock payment path in production. Integrate a real payment gateway with verified callbacks before accepting real payments.
- Configure HTTPS, backups, monitoring, logging, and secret management before using real society data.

---

## 🌟 Highlights

- Role-based workspaces for administrators, residents, and watchmen.
- Society-scoped data and backend authorization.
- End-to-end society operations from resident management to finance and reports.
- Responsive React interface backed by a REST API and MongoDB.

## 🔮 Future Improvements

- Integrate a production payment gateway.
- Add automated backend and end-to-end tests.
- Add project screenshots and deployment instructions once a production environment is available.

## 👨‍💻 Author

**Gilmaan Patait**
