# MegaProject2026-27

AgriCycle is a crop-residue marketplace prototype for farmers and buyers in Western Maharashtra. This repository currently contains the React/Vite frontend; the backend can be added as a sibling `backend/` directory.

## Repository layout

```text
frontend/   React + Vite application
backend/   Backend service (to be added)
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default. Demo sign-in and the marketplace actions are currently simulated; the UI is not yet wired to live backend endpoints.

## Connecting the backend

1. Start the backend locally and configure it to allow requests from `http://localhost:5173` during development (CORS).
2. Copy `frontend/.env.example` to `frontend/.env.local` and set `VITE_API_BASE_URL` to the backend API base URL, for example `http://localhost:5000/api`.
3. The shared Axios client is in `frontend/src/lib/apiClient.ts`. Import it in frontend data/service modules instead of hard-coding fetch URLs.
4. Agree on the endpoint paths, request/response JSON, authentication token behavior, and error format before wiring the existing demo pages to API calls.
5. Keep real credentials and local `.env` files out of Git. Only publish placeholder values in `.env.example`.

For hosted environments, configure `VITE_API_BASE_URL` in the frontend build/deployment environment. Vite exposes `VITE_` variables to browser code, so never put secrets in them.

## Frontend quality checks

```bash
cd frontend
npm run build
npm run lint
npm test
```

Generated dependencies, build output, and local validation state are excluded by `.gitignore`.
