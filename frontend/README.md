# Dinmay's Blog frontend

React 19 frontend built with Vite. The existing FastAPI service remains the publishing, administration, comments, uploads, and content API.

## Local development

```bash
npm ci
cp .env.example .env
npm run dev
```

The Vite development server opens on `http://localhost:5173`. Set `VITE_BACKEND_URL` to the FastAPI origin, without a trailing `/api` segment.

## Production build

```bash
npm run build
npm run preview
```

Vite writes the production site to `dist`.

## Render static site

The repository-level `render.yaml` contains the frontend Blueprint configuration. Set the `VITE_BACKEND_URL` environment variable in Render to the public HTTPS origin of the existing backend. The SPA rewrite sends application routes to `index.html`.

The backend's existing CORS environment setting must include the deployed frontend origin.

Manual Render settings, if the Blueprint is not used:

- Root directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Rewrite: `/*` to `/index.html`

The included multi-stage Dockerfile is an alternative production target and serves the generated Vite files through Nginx.
