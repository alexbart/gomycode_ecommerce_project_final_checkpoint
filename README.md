# MERN App Template

Starter template for a MERN application with a Vite + React + TypeScript client and an Express + TypeScript server.

## Structure

- `client/` - React frontend built with Vite
- `server/` - Express backend written in TypeScript

## Quick Start

1. Install dependencies from the template root:

```bash
npm install
```

2. Create environment files from the examples:

- `server/env.example` -> `.env`
- `client/.env.example` -> `client/.env`

3. Run both apps:

```bash
npm run dev
```

The client runs on the Vite dev server and the backend exposes `GET /` and `GET /health`.

## Notes

- The backend is set up for TypeScript compilation with `tsc` and development with `tsx`.
- MongoDB connection is optional during startup, but `MONGODB_URI` should be set for database features.

## Client environment variables

- See [client/.env.example](client/.env.example) for example Vite variables.
- Copy it to `client/.env` or create a `client/.env.local` (gitignored) and update values.

Example keys included in the example file:

- `VITE_API_URL` — API base URL for the frontend
- `VITE_APP_NAME` — Display name for the app
- `VITE_ENABLE_DEBUG` — Enable debug features (true/false)

Notes:

- Vite only exposes environment variables prefixed with `VITE_` to the client bundle.
- Keep secrets out of committed files; use `.env.local` for machine-specific secrets.

## Styling (Tailwind)

- This template uses Tailwind CSS in the client. The client index includes the Tailwind directives in [client/src/index.css](client/src/index.css#L1-L10).
- A minimal Tailwind config lives at [client/tailwind.config.cjs](client/tailwind.config.cjs).
- If you haven't installed Tailwind yet, run `npm install -D tailwindcss postcss autoprefixer` and then run `npx tailwindcss init -p` to generate a config and `postcss` file. The template already includes a basic config.
- Tailwind classes are used in the sample app UI (`client/src/App.tsx`). You can customize the theme in `client/tailwind.config.cjs`.