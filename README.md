# RFS Ponche

Recovered full-stack Vite app for Reaction Force Security vigilante ponche (`/`) and central panel (`/panel`).

## Stack

- React 19 + Vite (multi-page: `index.html`, `panel/index.html`)
- Vercel serverless API under `api/`
- Service worker: `public/sw.js`

## Environment (Vercel)

| Variable | Purpose |
|----------|---------|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Event/device storage (`@vercel/kv`) |
| `RFS_PANEL_PASSWORD` or `PANEL_PASSWORD` | Central panel login |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push alerts |

**Note:** Production at [rfs-ponche.vercel.app](https://rfs-ponche.vercel.app) already has data in its KV namespace. Point this project at the same KV credentials to stay compatible.

## Scripts

- `npm run dev` — local Vite dev server
- `npm run build` — production client build to `dist/`

## Flash / torch (vigilante)

On supported Android Chrome devices, **Tomar foto** opens a live `getUserMedia` preview; the **Flash** control toggles `track.applyConstraints({ advanced: [{ torch: true }] })`. Other devices keep the hidden file input with `capture="environment"`.
