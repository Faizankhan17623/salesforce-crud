# Salesforce CRUD

A web application for performing CRUD (Create, Read, Update, Delete) operations on Salesforce
standard objects — Account, Opportunity, Lead, Contact, and Case — through a custom UI, without
using the native Salesforce interface. Authentication is handled via OAuth 2.0 (Authorization
Code flow with PKCE) through a Salesforce External Client App.

**Live app:** https://salesforce-crud.vercel.app
**Repo:** https://github.com/Faizankhan17623/salesforce-crud

## Features

- Login with Salesforce (OAuth 2.0 + PKCE)
- Central dropdown to switch between Account, Opportunity, Lead, Contact, and Case
- Dynamic field columns and forms per object
- Infinite-scroll pagination — loads 20 records at a time, fetches more on scroll
- Create, edit, and delete records directly from the UI
- Search/filter records by name (or subject, for Case)
- Click-to-sort table columns (ascending/descending)
- Bulk select and bulk delete records
- Toast notifications for create, update, delete, and bulk-delete outcomes
- Animated skeleton loading state
- Dark mode toggle (persisted across sessions)

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Node.js + Express
- **Auth**: Salesforce OAuth 2.0 (Authorization Code + PKCE) via an External Client App
- **Data**: Salesforce REST API (SOQL queries, sObject CRUD endpoints)

## Project Structure

```
salesforce-crud/
├── backend/    Express server — OAuth flow + Salesforce API proxy
└── frontend/   React app — login, object dropdown, record table, create/edit modal
```

## Prerequisites

- Node.js 18+
- A Salesforce Developer Org ([signup](https://developer.salesforce.com/signup))
- A Salesforce External Client App with OAuth enabled:
  - Callback URL matching your backend's `/auth/callback` endpoint
  - Scopes: `api`, `refresh_token, offline_access`, `id, profile, email, address, phone`
  - Authorization Code and Credentials Flow enabled

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your Salesforce app credentials
npm start
```

Runs on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL if backend isn't on localhost:5000
npm run dev
```

Runs on `http://localhost:3000` by default (or whatever port Vite prints).

## Environment Variables

### backend/.env

| Variable | Description |
|---|---|
| `SALESFORCE_CLIENT_ID` | Consumer Key from the External Client App |
| `SALESFORCE_CLIENT_SECRET` | Consumer Secret from the External Client App |
| `SALESFORCE_CALLBACK_URL` | Must exactly match the callback URL configured in Salesforce |
| `SALESFORCE_LOGIN_URL` | `https://login.salesforce.com` (or your org's My Domain URL) |
| `FRONTEND_URL` | URL of the deployed/local frontend, used for CORS and post-login redirect |
| `PORT` | Port the backend listens on |

### frontend/.env

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | URL of the backend API |

## How It Works

1. User clicks **Login with Salesforce**, which hits `GET /auth/login` on the backend.
2. The backend generates a PKCE `code_verifier`/`code_challenge` pair and redirects to
   Salesforce's `/services/oauth2/authorize` endpoint.
3. After the user authorizes, Salesforce redirects back to `GET /auth/callback` with an
   authorization code, which the backend exchanges for an access token (using the stored
   `code_verifier`).
4. The backend redirects to the frontend with the access token and instance URL.
5. All subsequent CRUD requests from the frontend pass the token to the backend, which forwards
   them to the Salesforce REST API (`/services/data/v58.0/...`).

## Deployment

- **Backend**: deployed as a Node web service on Render, with the environment variables above
  configured on the host.
- **Frontend**: deployed as a static Vite build on Vercel, with `VITE_API_BASE_URL` pointed at
  the deployed backend.
- The External Client App's OAuth **Callback URL** is set to the deployed backend's
  `/auth/callback` URL, matching `SALESFORCE_CALLBACK_URL` on the backend host.
  `FRONTEND_URL` on the backend host points at the deployed Vercel URL.

Note: the free-tier backend may spin down after inactivity, so the first request after a period
of idle time can take up to a minute to respond.
