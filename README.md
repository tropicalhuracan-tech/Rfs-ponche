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

### Panel central (con Eliminar vigilante)

Si Vercel no ha redeployado el panel, usa la copia publicada en GitHub Pages (misma API en Vercel):

**https://tropicalhuracan-tech.github.io/Rfs-ponche/panel/**

Comprueba la versión en la barra de sync: **`v2026.10.23c`**. En el detalle del vigilante debe verse el botón rojo **Eliminar vigilante** arriba de la sirena.

## Scripts

- `npm run dev` — local Vite dev server
- `npm run build` — production client build to `dist/`

## Deploy (Vercel)

Production ([rfs-ponche.vercel.app](https://rfs-ponche.vercel.app)) must be **rebuilt** after changes to `src/panel/`. If GitHub is not linked to Vercel, pushes to `main` will not update the live site.

1. **Preferred:** GitHub Actions workflow `.github/workflows/vercel-production.yml` — add repo secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (from Vercel → Project → Settings → General), then push to `main` or run the workflow manually.
2. **Manual:** Vercel dashboard → project **rfs-ponche** → **Deployments** → **Redeploy** (latest `main`).

After deploy, open the panel and check the footer sync line includes **`v2026.10.23b`**. In a vigilante detail you should see a full-width red **Eliminar vigilante** above the siren buttons.

## Flash / torch (vigilante)

On supported Android Chrome devices, **Tomar foto** opens a live `getUserMedia` preview; the **Flash** control toggles `track.applyConstraints({ advanced: [{ torch: true }] })`. Other devices keep the hidden file input with `capture="environment"`.
