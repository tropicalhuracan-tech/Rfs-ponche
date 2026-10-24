# Despliegue automático a Vercel

Cada **push a `main`** ejecuta el workflow [Vercel production](../.github/workflows/vercel-production.yml) y publica en el proyecto Vercel (por ejemplo `rfs-ponche.vercel.app`). Los **pull requests** pueden generar una URL de preview con [Vercel preview](../.github/workflows/vercel-preview.yml).

## Configuración única (≈5 minutos)

### 1. Token de Vercel

1. Entra en [Vercel → Account Settings → Tokens](https://vercel.com/account/tokens).
2. Crea un token con acceso al team/cuenta donde está el proyecto **rfs-ponche**.
3. Copia el valor (solo se muestra una vez).

### 2. IDs del proyecto

Con el [Vercel CLI](https://vercel.com/docs/cli) en tu máquina (después de `vercel login`):

```bash
cd Rfs-ponche
vercel link   # elige el proyecto rfs-ponche existente
cat .vercel/project.json
```

O en el dashboard: **Project → Settings → General** → **Project ID**.  
El **Team ID** (ORG) aparece en **Team Settings → General** o en la URL del team.

### 3. Secretos en GitHub

En el repo [tropicalhuracan-tech/Rfs-ponche](https://github.com/tropicalhuracan-tech/Rfs-ponche):

**Settings → Secrets and variables → Actions → New repository secret**

| Secreto | Valor |
|---------|--------|
| `VERCEL_TOKEN` | Token del paso 1 |
| `VERCEL_ORG_ID` | `orgId` de `.vercel/project.json` o Team ID |
| `VERCEL_PROJECT_ID` | `projectId` de `.vercel/project.json` |

### 4. Probar

```bash
git push origin main
```

En **Actions** debe verse **Vercel production** en verde. En unos minutos, [rfs-ponche.vercel.app/panel/](https://rfs-ponche.vercel.app/panel/) servirá el nuevo bundle.

También puedes lanzar el despliegue a mano: **Actions → Vercel production → Run workflow**.

## Variables de entorno en Vercel

El workflow hace `vercel pull` antes del build, pero las variables sensibles deben seguir definidas en **Vercel → Project → Settings → Environment Variables** (Production):

- `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- `RFS_PANEL_PASSWORD` o `PANEL_PASSWORD`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`

## ¿Integración Git de Vercel o GitHub Actions?

Usa **solo uno** para evitar despliegues duplicados:

- **GitHub Actions (este repo):** secretos arriba; no conectes el mismo repo otra vez en Vercel Git si no quieres dos builds por push.
- **Vercel Git nativo:** conecta el repo en el dashboard de Vercel y desactiva o borra `.github/workflows/vercel-production.yml`.

Para este repositorio la opción recomendada es **GitHub Actions + secretos**, porque el proyecto en Vercel ya existía antes de enlazar GitHub.
