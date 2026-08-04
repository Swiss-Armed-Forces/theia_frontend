---
name: run-app
description: Launch the Theia frontend dev server and drive it in headless Chromium via Playwright to verify a change actually renders/works, with a screenshot as proof.
---

# Running and verifying the Theia frontend

This is a Vite + React SPA (`react-leaflet` map) talking to a FastAPI backend
at `http://localhost:8000`. There is no test suite and no pre-existing
browser-automation tooling in this repo (no `chromium-cli`, no Playwright by
default) — this skill sets that up and documents the working recipe so it
doesn't need to be rediscovered.

## 1. Dev server

```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill   # free the port if a stale server is running
npm run dev > /tmp/vite-dev.log 2>&1 &
disown
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

The backend must already be running and reachable at `http://localhost:8000`
(check with `curl -s http://localhost:8000/health`) — the frontend has no
mock/offline mode.

## 2. Playwright (headless Chromium)

`playwright` is a devDependency (added when this skill was created). If it's
ever missing: `npm install -D playwright`.

**Browser binary version must match the installed `playwright` package** — a
stale/mismatched cache in `~/.cache/ms-playwright` fails with
`Executable doesn't exist at .../chrome-headless-shell`. Fix by downloading
the matching build (safe to always run, it's a no-op if already current):

```bash
npx playwright install chromium
```

This is a ~300-400MB download the first time — it can take a few minutes,
that's normal, not a hang.

**Module resolution gotcha:** a driver script only resolves `import { chromium }
from "playwright"` if it lives somewhere under this project's `node_modules`
ancestor chain. Keep driver scripts inside the repo (e.g. this skill
directory) — running one from `/tmp` fails with `ERR_MODULE_NOT_FOUND` even
though the package is installed.

## 3. Smoke-test drive

`drive.mjs` in this directory is a generic driver: loads the app, waits for
the map (`.leaflet-container`) to render, reports any console errors, and
saves a full-page screenshot.

```bash
node .claude/skills/run-app/drive.mjs http://localhost:5173 /path/to/screenshot.png
```

**Look at the screenshot** — a blank/error page is a failure to launch, not
a pass.

## 4. Writing a feature-specific check

For anything beyond the generic smoke test, write a one-off script alongside
`drive.mjs` (or inline via `node -e "..."` run from the repo root) using the
`playwright` package directly. Patterns that came up verifying the
GeoJSON-overlay feature (backend-fetched named map polygons with per-team
show/hide chips, see `git log` for that change) and generalize to any
map/sidebar feature here:

- **Sidebar sections are `<fieldset>` with a `<legend>`.** Target one via
  `page.locator("fieldset", { hasText: "Some Legend" })`, then `.locator("button")`
  for its controls (chips, switches, button-groups all render as `<button>`).
- **Leaflet renders both data polygons and markers as SVG `<path>` — they are
  not distinguishable by a generic `path.leaflet-interactive` selector alone.**
  Data layers (`<GeoJSON>`) live under `.leaflet-overlay-pane`; markers live
  under `.leaflet-marker-pane`. Scope your selector to
  `.leaflet-overlay-pane path` when you specifically want rendered polygons,
  not sensor/track markers.
- **Hovering the centroid of a polygon's bounding box can land on a marker
  instead** (radar/track markers are often positioned inside the coverage
  shape they belong to, and markers sit in a higher z-index pane). Hover near
  a bbox corner (`box.x + 3, box.y + 3`) instead of the center, or hide the
  marker pane via `page.evaluate` before asserting on a polygon's own
  tooltip.
- **React `<StrictMode>` (see `src/main.tsx`) double-invokes effects in dev
  only.** A `useEffect(() => { fetch(...) }, [])` intended to fire once will
  issue two requests in `npm run dev` — this is expected React dev behavior,
  not a bug, and does not happen in a production build. Don't chase it as a
  regression; if you need to confirm "fetched once" semantics for real,
  either test against a `vite preview` production build or de-dupe the
  assertion by unique URL rather than by request count.

## 5. Teardown

```bash
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill
```
