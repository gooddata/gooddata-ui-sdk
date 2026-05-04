# tiny_web_server

A small Go HTTP server that replaces the previous webpack-dev-server-based `SimpleWebserver/` setup used to serve the e2e test page for `sdk-ui-web-components`.

## Why

The old setup used webpack-dev-server purely as a static file server with a couple of dev-server features (HTTPS, a proxy, CORS headers). That meant:

1. Installing a node_modules tree (webpack, webpack-cli, webpack-dev-server, http-proxy-middleware, …) just to serve files.
2. Running a heavy node toolchain in the test container.

This Go binary does the same job with no install step and a single statically-linked executable. The container image stays tiny (built `FROM scratch`).

## What it does

On startup, from its current working directory:

1. Resolves `./static/` as the document root.
2. Generates `./static/web-components/config.js`, which exposes `window.__WC_TEST_CONFIG__` to the test page. Values come from a live `.env` file (if present) with `os.Getenv` as fallback:
    - `HOST` — backend host the dashboard talks to (default `https://localhost:8443`).
    - `TEST_WORKSPACE_ID`, `TEST_DASHBOARD_ID` — fixtures for the e2e test page.
    - `auth` is hard-coded to `"sso"`.
3. Generates an in-memory self-signed TLS certificate (mirroring webpack-dev-server's `https: true`).
4. Reads the `PROXY_HOST` env var to decide how to handle `/components/*`:
    - If set: proxies `/components/*` to `${PROXY_HOST}/components/*` (HTTPS, accepts self-signed upstream certs, rewrites `Host` header).
    - If not set: serves `/components/*` from the local `./static/components/` directory.
      There is no fallback between the two — it's one mode or the other for the lifetime of the process.
5. Starts an HTTPS server on port `3001`. All responses get the same CORS headers the old config emitted:
    - `Access-Control-Allow-Origin: *`
    - `Access-Control-Allow-Private-Network: true`
    - `Access-Control-Allow-Headers: *`

The Dockerfile (one level up) extracts `sdk-ui-web-components.tgz` into `./static/components/`, so the local mode serves the bundle that was packed at build time.

## Run locally

```sh
cd tiny_web_server
go run . # serves https://localhost:3001
```

Set `PROXY_HOST=https://some-env.example.com` to proxy `/components/*` to a live env instead of serving local files.
