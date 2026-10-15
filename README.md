# SocioHub

SocioHub is a society management system for admins, owners, and tenants.

## Project structure

```text
sociohub/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       ├── context/
│       └── App.jsx
└── backend/
    └── src/
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        ├── utils/
        ├── app.js
        └── server.js
```

## Run the frontend

```bash
cd frontend
npm run dev
```

## Run the backend

```bash
cd backend
npm run dev
```

The backend currently exposes `GET /api/health` on port `4000` as a starting point for the API.
