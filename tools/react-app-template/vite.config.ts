// (C) 2026 GoodData Corporation

import * as fs from "fs";
import type {
    ClientRequest,
    IncomingHttpHeaders,
    IncomingMessage,
    OutgoingHttpHeaders,
    ServerResponse,
} from "http";
import * as path from "path";
import type { TLSSocket } from "tls";
import { fileURLToPath } from "url";

import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import { type Plugin, type ProxyOptions, type UserConfig, defineConfig, loadEnv, normalizePath } from "vite";

interface ITemplatePackageJson {
    gooddata: {
        hostname: string;
        workspaceId: string;
        backend: string;
    };
}

const pack = JSON.parse(
    fs.readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as ITemplatePackageJson;

const BACKEND_URL = pack.gooddata.hostname;
const WORKSPACE_ID = pack.gooddata.workspaceId;
// The dev server speaks the backend's protocol: an https backend gets an https dev server with a self-signed
// certificate from @vitejs/plugin-basic-ssl (accept it once in your browser), so cookies the backend flags
// Secure are stored; an http backend such as a local GoodData.CN gets plain http.
const IS_HTTPS_BACKEND = new URL(BACKEND_URL).protocol === "https:";
const DEV_SERVER_HOST = "127.0.0.1";

// Everything that has to reach the backend rather than the dev server.
const BACKEND_ENDPOINTS = "^/(api/|gdc/|account\\.html|truste\\.html|account/)";
// The backend's default MapLibre style document, with or without a query string. Everything else under
// /api/v1/location (the /styles list, a style by id, tiles, sprites and glyphs) falls through to the generic
// rule and streams untouched.
const GEO_STYLE_ENDPOINT = "^/api/v1/location/style(?:$|\\?)";
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type JsonRecord = Record<string, unknown>;

// ---------------------------------------------------------------------------------------------------
// Relative imports name the emitted file (`./App.js`) even though the source is App.tsx - or App.jsx in
// the JavaScript flavour of this template. Vite retries a ".js" specifier as ".ts"/".tsx" on its own,
// but not as ".jsx"; this plugin covers that one case, and only for this application's own sources -
// dependencies resolve on their own.
// ---------------------------------------------------------------------------------------------------

const SRC_DIR = normalizePath(fileURLToPath(new URL("./src/", import.meta.url)));

function jsxExtensionAlias(): Plugin {
    return {
        name: "jsx-extension-alias",
        enforce: "pre",
        resolveId(source: string, importer: string | undefined): string | null {
            if (!importer || !source.startsWith(".") || !source.endsWith(".js")) {
                return null;
            }
            // Vite hands over ids with forward slashes and an optional query string.
            const importerPath = normalizePath(importer.split("?")[0]);
            if (!importerPath.startsWith(SRC_DIR)) {
                return null;
            }
            const requested = path.resolve(path.dirname(importerPath), source);
            if (fs.existsSync(requested)) {
                return null;
            }
            const jsx = requested.replace(/\.js$/, ".jsx");
            return fs.existsSync(jsx) ? normalizePath(jsx) : null;
        },
    };
}

// ---------------------------------------------------------------------------------------------------
// Geo style proxy. MapLibre style documents carry absolute backend URLs for glyphs and tiles; the proxy
// rewrites them to the dev-server origin so the browser fetches them through the proxy (same-origin and
// authenticated) instead of directly. A copy of common/dev-server/locationStyleProxy.js from the
// gooddata-ui-sdk monorepo (the template ships standalone, so it cannot import it) plus the response
// header sanitising that Vite's HTTP/2 server needs - keep the rest in sync with the original. The
// original's response decompression is deliberately left out: the request below asks for "identity", so
// the body arrives as plain JSON - same as in the dashboard-plugin-template dev server.
// ---------------------------------------------------------------------------------------------------

// Headers that describe the proxy<->backend connection rather than the payload. http-proxy strips them
// itself, but not with selfHandleResponse - and Vite serves https over HTTP/2, where copying
// connection/transfer-encoding onto the browser response throws ERR_HTTP2_INVALID_CONNECTION_HEADERS.
const HOP_BY_HOP_HEADERS = new Set<string>([
    "connection",
    "http2-settings",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "proxy-connection",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
]);

function applyProxyRequestHeaders(proxyReq: ClientRequest): void {
    // The backend rejects cross-origin requests. "identity" overrides the browser's own accept-encoding
    // for the proxied request, so the style rewrite below reads the JSON body directly.
    proxyReq.removeHeader("origin");
    proxyReq.setHeader("accept-encoding", "identity");
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function getRequestOrigin(req: IncomingMessage): string {
    // HTTP/2 requests carry the host in the ":authority" pseudo-header, HTTP/1.1 requests in "host". Deriving
    // the origin per request keeps the rewritten URLs correct for whichever of 127.0.0.1 / localhost you typed.
    const host = firstHeaderValue(req.headers[":authority"]) ?? req.headers.host ?? "";
    const scheme =
        firstHeaderValue(req.headers[":scheme"]) ?? ((req.socket as TLSSocket).encrypted ? "https" : "http");
    return `${scheme}://${host}`;
}

function sanitizeResponseHeaders(headers: IncomingHttpHeaders): OutgoingHttpHeaders {
    const sanitized: OutgoingHttpHeaders = {};
    for (const [name, value] of Object.entries(headers)) {
        if (value !== undefined && !HOP_BY_HOP_HEADERS.has(name)) {
            sanitized[name] = value;
        }
    }
    return sanitized;
}

function isJsonRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null;
}

function rewriteLocationStyleResponse(buffer: Buffer, origin: string): string {
    // Swap all backend-origin URLs to the dev-server origin so MapLibre fetches
    // them through the Vite proxy instead of directly (which would be cross-origin).
    const payload: unknown = JSON.parse(buffer.toString("utf8"));

    if (!isJsonRecord(payload)) {
        return JSON.stringify(payload);
    }

    if (typeof payload["glyphs"] === "string") {
        payload["glyphs"] = replaceUrlOrigin(payload["glyphs"], origin);
    }

    // NOTE: sprite URLs are intentionally NOT rewritten. The sprite sheet is
    // served by an external tile server and is not proxied through the dev
    // server, so it must keep its original absolute URL.

    const sources = payload["sources"];
    if (isJsonRecord(sources)) {
        Object.values(sources).forEach((source) => {
            if (isSourceWithTiles(source)) {
                source.tiles = source.tiles.map((tileUrl) => replaceUrlOrigin(tileUrl, origin));
            }
        });
    }

    return JSON.stringify(payload);
}

function replaceUrlOrigin(value: string, origin: string): string {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        return value;
    }

    const originMatch = value.match(/^[a-z]+:\/\/[^/]+/i);
    if (!originMatch) {
        return `${origin}${value}`;
    }

    const suffix = value.slice(originMatch[0].length);
    return `${origin}${suffix}`;
}

function isSourceWithTiles(source: unknown): source is { type: string; tiles: string[] } {
    if (!isJsonRecord(source)) {
        return false;
    }

    const typeValue = source["type"];
    if (typeValue !== "vector" && typeValue !== "raster") {
        return false;
    }

    const tilesValue = source["tiles"];
    return Array.isArray(tilesValue) && tilesValue.every((tile) => typeof tile === "string");
}

function respondWithError(res: ServerResponse, message: string, error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[devServer] ${message}`, error);
    if (res.headersSent) {
        res.destroy();
        return;
    }
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: message }));
}

function handleLocationStyleResponse(
    proxyRes: IncomingMessage,
    req: IncomingMessage,
    res: ServerResponse,
): void {
    const chunks: Buffer[] = [];
    proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
    proxyRes.on("error", (err) => respondWithError(res, "Failed to read geo style response.", err));
    proxyRes.on("end", () => {
        const buffer = Buffer.concat(chunks);

        if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
            res.writeHead(proxyRes.statusCode, sanitizeResponseHeaders(proxyRes.headers));
            res.end(buffer);
            return;
        }

        try {
            const rewrittenBody = rewriteLocationStyleResponse(buffer, getRequestOrigin(req));
            res.setHeader("content-type", "application/json");
            res.end(rewrittenBody);
        } catch (rewriteErr) {
            respondWithError(res, "Failed to rewrite geo style response.", rewriteErr);
        }
    });
}

// Both proxy rules talk to the same backend the same way; only the response handling differs.
function createProxyBase(apiToken: string | undefined): ProxyOptions {
    // Inject the auth token through the dev proxy to simplify development setup. In production you need
    // proper auth handling, see ./src/backend.
    const authToken = pack.gooddata.backend === "tiger" ? apiToken : undefined;

    return {
        target: BACKEND_URL,
        changeOrigin: true,
        // An empty string strips the Domain attribute, so the browser stores a host-only cookie that is valid
        // for whichever of 127.0.0.1 / localhost you opened the dev server on.
        cookieDomainRewrite: "",
        secure: false,
        headers: {
            // "null" is the serialised opaque origin; it also covers requests http-proxy skips the proxyReq
            // hook for (those carrying `Expect: 100-continue`).
            origin: "null",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
    };
}

function createGeoStyleProxyOptions(proxyBase: ProxyOptions): ProxyOptions {
    return {
        ...proxyBase,
        headers: {
            ...proxyBase.headers,
            // The backend requires style requests to look like XHR.
            "X-Requested-With": "XMLHttpRequest",
        },
        selfHandleResponse: true,
        configure: (proxy) => {
            proxy.on("proxyReq", applyProxyRequestHeaders);
            proxy.on("proxyRes", handleLocationStyleResponse);
        },
    };
}

export default defineConfig(({ mode }): UserConfig => {
    // Only the variables this config reads. Neither carries the VITE_ prefix, so neither reaches the client
    // bundle; TIGER_API_TOKEN is used exclusively inside the proxy.
    const env = loadEnv(mode, process.cwd(), ["PORT", "TIGER_API_TOKEN"]);
    const port = Number(env["PORT"]) || 3000;
    const proxyBase = createProxyBase(env["TIGER_API_TOKEN"]);

    return {
        // basic-ssl generates its certificate in configResolved whatever the command; restricting it to "serve"
        // keeps `vite build` from creating one it never uses.
        plugins: [jsxExtensionAlias(), react(), IS_HTTPS_BACKEND && { ...basicSsl(), apply: "serve" }],
        define: {
            WORKSPACE_ID: JSON.stringify(WORKSPACE_ID),
        },
        resolve: {
            // Dedupe packages to avoid duplicate instances
            dedupe: ["@codemirror/state", "@codemirror/view", "react", "react-dom"],
        },
        build: {
            target: "es2022",
            // The sample app imports the whole GoodData.UI SDK, so its main chunk is several MB. Raise the limit
            // (kB) above that size: the warning would only restate what is inherent to this template; split the
            // bundle with dynamic import() once your own application grows.
            chunkSizeWarningLimit: 10000,
        },
        server: {
            host: DEV_SERVER_HOST,
            port,
            // Fail when the port is taken instead of silently moving to the next free one.
            strictPort: true,
            open: true,
            // The proxy injects TIGER_API_TOKEN into backend requests. Vite's default CORS policy would let any
            // page served from localhost call this dev server - and therefore the backend with your token.
            cors: false,
            proxy: {
                // Vite matches proxy keys in insertion order; the geo style endpoint must win over the generic rule.
                [GEO_STYLE_ENDPOINT]: createGeoStyleProxyOptions(proxyBase),
                [BACKEND_ENDPOINTS]: {
                    ...proxyBase,
                    configure: (proxy) => {
                        proxy.on("proxyReq", applyProxyRequestHeaders);
                    },
                },
            },
        },
    };
});
