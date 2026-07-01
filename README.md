# Origin IV

Full-stack e-commerce store for a hand-painted streetwear brand built with Next.js.

## Features

- Product catalog with filtering
- Custom garment design tool
- Cart and checkout with form validation
- Commission request form
- Login / register with cookie-based sessions
- Admin dashboard for managing products and orders

## Tech Stack

- Next.js 16 (App Router)
- React 19
- SQLite via better-sqlite3
- bcryptjs for password hashing
- AES-256 encrypted sessions

## Getting Started

```bash
git clone https://github.com/farajarshad01/Origin-IV-Clothing-Store.git
cd Origin-IV-Clothing-Store
npm install
npm run dev
```

The database is created and seeded automatically on first run.

## Demo Accounts

| Role     | Email                    | Password       |
|----------|--------------------------|----------------|
| Admin    | admin@originiv.com       | originivadmin  |
| Customer | customer@originiv.com    | customer123    |

## Deployment

This app uses `better-sqlite3`, a native Node.js binary. Vercel and Netlify are not supported.
Deploy on Railway — it runs the app as a container and compiles native binaries correctly.

## Environment Variables

| Variable         | Description                                      |
|------------------|--------------------------------------------------|
| `SESSION_SECRET` | Secret key for session encryption. Change this in production. |
