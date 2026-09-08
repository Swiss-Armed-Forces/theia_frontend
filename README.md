# Theia Frontend

A live visualisation frontend for a running Theia simulation: situational
picture, ground truth, and sensor coverage on a map.

For the concepts behind what you're seeing (physics model, system
architecture), see the
[theia_backend documentation](https://github.com/Swiss-Armed-Forces/theia_backend).

## Installation

```bash
npm install
```

The frontend polls a `theia_backend` server for live simulation data. It
expects that server at `http://localhost:8000` (not currently
configurable). Start a scenario simulation interactively — see the
backend's
[running the server](https://github.com/Swiss-Armed-Forces/theia_backend/blob/main/doc/source/running.rst)
docs — before starting the frontend.

Map tiles are fetched live from public OpenStreetMap/ArcGIS servers; no
local terrain or tile data is needed for this repository.

## Running

```bash
npm run dev
```

Serves the frontend at `http://localhost:5173`. Stop it with `Ctrl+C`.

## Development

### Regenerating backend communication types

The backend's OpenAPI schema is used to generate typed API bindings:

```bash
cd src/hooks/
npx openapi-typescript openapi.json -o schema.d.ts
```
