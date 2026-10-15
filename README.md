# SocioHub

SocioHub is a web application for managing the day-to-day operations of a residential society. It provides separate workspaces for society administrators, owners and tenants, and watchmen. The frontend is a React single-page application; the API is built with Express and MongoDB/Mongoose.

## Contents

- [Features](#features)
- [Roles and access](#roles-and-access)
- [Technology](#technology)
- [Project layout](#project-layout)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Environment variables](#environment-variables)
- [Data and API](#data-and-api)
- [Checks](#checks)
- [Production notes](#production-notes)

## Features

### Society administration

- Register a society and its first administrator.
- Maintain society details, wings, flats, parking, and resident assignments.
- Manage owner and tenant accounts, including flat assignment and replacement confirmation when a flat is already assigned.
- Create maintenance bills and review their status and payment history.
- Record the society opening balance, income, and expenses; view the current fund balance and transactions.
- Review and manage complaints.
- Publish society announcements.
- View reports for maintenance, income and expenses, complaints, and watchman attendance.
- Manage watchman accounts and review attendance.
- Update the administrator profile and password.

The admin workspace does not include a visitor log. Visitor handling is available to watchmen and residents.

### Resident and tenant workspace

- View dashboard information, assigned flat, and parking details.
- Read society information, amenities, and internal features.
- View maintenance bills and payment history, and print or save a bill/receipt as PDF through the browser print dialog.
- Submit and follow complaints.
- Read announcements and receive notifications.
- Participate in wing and society community discussions.
- View visitors registered for their flat and approve or reject requests.
- View society watchmen and manage their own profile and password.

Owners and tenants currently use the same resident feature set; the assigned role is shown where relevant.

### Watchman workspace

- Register visitors against flats in the watchman's society.
- Review visitor requests and record entry and exit activity.
- Start and end duty shifts and view attendance history.
- View the flat list needed for visitor registration. Resident contact details are not included in the watchman's flat listing.

## Roles and access

The backend enforces authorization on API routes; frontend route checks provide the matching user experience.

| Role | Main access |
| --- | --- |
| `ADMIN` | Society setup, resident and watchman administration, bills, finance, complaints, announcements, reports, and attendance review. |
| `OWNER` | Resident workspace, own flat and visitor workflows, bills, complaints, community, and announcements. |
| `TENANT` | Resident workspace, own flat and visitor workflows, bills, complaints, community, and announcements. |
| `WATCHMAN` | Visitor operations, flat lookup for visitor registration, own attendance, and profile. |

Records are scoped to a society in the backend. Resident bill, complaint, and visitor operations are further scoped to the authenticated resident's assigned flat where appropriate.

## Technology

- **Frontend:** React 19, React Router, Vite
- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT), with passwords hashed using bcryptjs
- **Other backend packages:** CORS, dotenv

## Project layout

```text
SocioHub/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- components/
|       |-- layouts/
|       |-- pages/
|       `-- services/       # Frontend API client
`-- backend/
    `-- src/
        |-- config/         # MongoDB connection
        |-- controllers/    # HTTP request handlers
        |-- middleware/     # Authentication and role authorization
        |-- models/         # Mongoose data models
        |-- routes/         # REST API routes
        |-- services/       # Application/business logic
        `-- utils/
```

## Requirements

- Node.js and npm
- A MongoDB database, either a local MongoDB server or a MongoDB Atlas cluster

## Run locally

Open two terminal windows from the repository root.

### 1. Configure the backend

Create `backend/.env` using the variables shown below. For local MongoDB, the default database URI is `mongodb://127.0.0.1:27017/sociohub`; you can omit `MONGODB_URI` when using that local default.

Install dependencies and start the API:

```powershell
cd backend
npm install
npm run dev
```

The backend listens on port `4000` by default. Check `http://localhost:4000/api/health` for the health response.

### 2. Configure and start the frontend

Create `frontend/.env` and set `VITE_API_URL` to the backend API base URL. For local development:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

Then install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

### 3. Create an account

Use **Create account** from the application sign-in page to register a society and its first admin account. The administrator can then configure wings, flats, residents, and watchmen. Residents and watchmen are managed by the society administrator.

## Environment variables

### Backend (`backend/.env`)

```dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/sociohub
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

- `PORT`: HTTP port for the API. Defaults to `4000`.
- `MONGODB_URI`: MongoDB connection string. Defaults to the local `sociohub` database shown above. For Atlas, use the connection string from Atlas and keep it private.
- `JWT_SECRET`: required to sign and verify login tokens. Set a strong, unique secret outside development.
- `JWT_EXPIRES_IN`: JWT lifetime accepted by `jsonwebtoken`; defaults to `7d`.
- `CORS_ORIGIN`: comma-separated list of browser origins allowed to call the API. If unset, local Vite origins on ports `5173` are allowed.

### Frontend (`frontend/.env`)

```dotenv
VITE_API_URL=http://localhost:4000/api
```

`VITE_API_URL` is the base URL for the API. Frontend variables prefixed with `VITE_` are included in the browser build; never put passwords, database URIs, or signing secrets in frontend environment variables.

Environment files are excluded by the root `.gitignore`. Keep real secrets in local environment files or your hosting provider's secret settings, not in GitHub.

## Data and API

The Express API is mounted under `/api`. Its main resource groups are:

| Route | Purpose |
| --- | --- |
| `/api/auth` | Society registration, sign-in, current user, profile, and password change. |
| `/api/societies` | Society details for the authenticated society. |
| `/api/wings`, `/api/flats`, `/api/parking` | Society structure and parking assignments. |
| `/api/residents`, `/api/watchmen` | Admin account and assignment management; resident watchman directory. |
| `/api/bills` | Maintenance bills and resident bill payment/receipt records. |
| `/api/finance` | Admin opening balance, income, expenses, transactions, and fund summary. |
| `/api/complaints` | Resident complaint submission and admin complaint management. |
| `/api/announcements` | Admin announcements and resident announcement feed. |
| `/api/community` | Society/wing posts and comments. |
| `/api/visitors` | Watchman visitor registration and resident approval workflows. |
| `/api/watchman-attendance` | Watchman duty and admin attendance views. |
| `/api/notifications` | Authenticated-user notification inbox and read status. |
| `/api/reports` | Admin society reports. |
| `/api/health` | API health check. |

MongoDB models include societies, users, wings, flats, parking, maintenance bills, payments, finance transactions, complaints, announcements, community posts/comments, visitors, watchman attendance, and notifications.

## Checks

From `frontend/`:

```powershell
npm run lint
npm run build
```

The backend package currently provides `dev` and `start` scripts; it does not currently define an automated test script.

## Production notes

- Host the frontend and backend at reachable URLs and configure `VITE_API_URL` and `CORS_ORIGIN` for those deployed origins. `localhost` only refers to the machine making the request.
- Configure `MONGODB_URI` and `JWT_SECRET` as backend secrets. Allow Atlas network access only from the backend's required address(es), not every IP.
- The current maintenance checkout is a **development-only demo payment**. The backend blocks this mock payment path in production. A real payment gateway integration with verified payment callbacks must be implemented before collecting real payments.
- Review the deployment provider's HTTPS, backup, monitoring, logging, and secret-management configuration before using real society data.
