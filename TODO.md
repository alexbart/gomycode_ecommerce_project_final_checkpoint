# TODO - Fix Vercel `/admin` 404

## Step 1 (done)

- Update `vercel.json` for SPA catch-all rewrites.

## Step 2 (after redeploy)

- Verify deployed routes:
  - `GET https://the-ecomart.vercel.app/admin` returns HTML (status 200)
  - `GET https://the-ecomart.vercel.app/favicon.ico` returns 200 (or at least not 404)

## Step 3 (only if Step 2 fails)

- Adjust `server/src/server.ts` SPA static/fallback logic for Vercel production.
