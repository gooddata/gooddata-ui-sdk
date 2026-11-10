# gdc-host-ui-template-name-harness

Standalone development harness for **gdc-host-ui-template-name-module**.

## What this does

The harness runs the real host runtime (`@gooddata/sdk-ui-pluggable-host`) against your backend and replaces the default header, navigation and layout with the host UI module from `../module`. It provides:

- A Vite dev server with backend API proxying
- The host UI module registered with `registerLocalHostUiModuleLoader`, so changes to the module source reload at once
- Two sample applications (one organization-scoped, one workspace-scoped) next to the applications from your organization's registry
- HTTPS support via local certificates (optional)

## Development

```bash
# Copy environment template and fill in your backend and API token
cp .env.template .env

# Start dev server
npm run dev
```

The server starts at `https://localhost:<port>`.

## Configuration

| Variable          | Default       | Description                            |
| ----------------- | ------------- | -------------------------------------- |
| `BACKEND_URL`     | _(required)_  | GoodData backend to proxy API calls to |
| `TIGER_API_TOKEN` | _(required)_  | API token for authentication           |
| `PORT`            | {harnessPort} | Dev server port                        |
