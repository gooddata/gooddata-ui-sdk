# gdc-app-template-name-harness

Standalone development harness for **gdc-app-template-name-module**.

This is a template. Run `rush init-pluggable-app` to scaffold a new application from it.

## What this does

The harness runs the pluggable application module outside of the full host shell. It provides:

- A Vite dev server with backend API proxying
- Local application registration (the module is lazy-loaded the same way the host would load it)
- GoodData UI Kit CSS and Indigo font
- HTTPS support via local certificates (optional)

## Development

```bash
# Copy environment template and fill in your API token
cp .env.template .env

# Start dev server
rushx dev
```

The server starts at `https://localhost:<port>`. Navigate to the appropriate scope URL:

- **Organization-scoped apps**: `https://localhost:<port>/organization/<route>`
- **Workspace-scoped apps**: `https://localhost:<port>/workspace/<workspaceId>/<route>`

## Configuration

| Variable          | Default       | Description                            |
| ----------------- | ------------- | -------------------------------------- |
| `BACKEND_URL`     | _(required)_  | GoodData backend to proxy API calls to |
| `TIGER_API_TOKEN` | _(required)_  | API token for authentication           |
| `PORT`            | {harnessPort} | Dev server port                        |

## Build

```bash
rushx build
```

Produces a production bundle in `dist/`.
