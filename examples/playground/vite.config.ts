// (C) 2019-2026 GoodData Corporation

import * as fs from "fs";
import type { ClientRequest, IncomingMessage, ServerResponse } from "http";
import * as path from "path";
import * as zlib from "zlib";

import react from "@vitejs/plugin-react";
import { type ProxyOptions, type ServerOptions, defineConfig, loadEnv } from "vite";

const packagesWithoutStyles = [
    "@gooddata/sdk-model",
    "@gooddata/sdk-backend-base",
    "@gooddata/sdk-backend-spi",
    "@gooddata/sdk-backend-tiger",
    "@gooddata/sdk-ui-loaders",
    "@gooddata/sdk-ui-theme-provider",
    "@gooddata/sdk-embedding",
];

const packagesWithStyles = [
    "@gooddata/sdk-ui-dashboard",
    "@gooddata/sdk-ui-ext",
    "@gooddata/sdk-ui",
    "@gooddata/sdk-ui-charts",
    "@gooddata/sdk-ui-filters",
    "@gooddata/sdk-ui-gen-ai",
    "@gooddata/sdk-ui-geo",
    "@gooddata/sdk-ui-pivot",
    "@gooddata/sdk-ui-semantic-search",
    "@gooddata/sdk-ui-kit",
    "@gooddata/sdk-ui-vis-commons",
    "@gooddata/sdk-ui-catalog",
];

const GEO_STYLE_ENDPOINT = "^/api/v1/location/style($|\\?)";
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null;
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

function rewriteLocationStyleResponse(buffer: Buffer, origin: string): string {
    const text = buffer.toString("utf8");
    let payload: unknown;

    try {
        payload = JSON.parse(text);
    } catch {
        return text;
    }

    if (!isJsonRecord(payload)) {
        return text;
    }

    if (typeof payload["glyphs"] === "string") {
        payload["glyphs"] = replaceUrlOrigin(payload["glyphs"], origin);
    }

    // sprite can be a string or an array of { id, url } objects (MapLibre v3+)
    if (typeof payload["sprite"] === "string") {
        payload["sprite"] = replaceUrlOrigin(payload["sprite"], origin);
    } else if (Array.isArray(payload["sprite"])) {
        payload["sprite"] = (payload["sprite"] as JsonRecord[]).map((entry) =>
            entry && typeof entry["url"] === "string"
                ? { ...entry, url: replaceUrlOrigin(entry["url"], origin) }
                : entry,
        );
    }

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

function handleProxyRequest(proxyReq: ClientRequest): void {
    proxyReq.removeHeader("origin");
    proxyReq.setHeader("accept-encoding", "identity");
}

function getPrimaryContentEncoding(encoding: string | string[] | undefined): string {
    const headerValue = Array.isArray(encoding) ? encoding.join(",") : (encoding ?? "");
    const [primaryEncoding = ""] = headerValue.split(",");
    return primaryEncoding.split(";")[0].trim().toLowerCase();
}

function decompressBuffer(buffer: Buffer, encoding: string | string[] | undefined): Promise<Buffer> {
    const normalizedEncoding = getPrimaryContentEncoding(encoding);

    return new Promise((resolve, reject) => {
        const callback = (err: Error | null, result: Buffer) => (err ? reject(err) : resolve(result));

        if (normalizedEncoding === "gzip") {
            zlib.gunzip(buffer, callback);
        } else if (normalizedEncoding === "br") {
            zlib.brotliDecompress(buffer, callback);
        } else if (normalizedEncoding === "deflate") {
            zlib.inflate(buffer, callback);
        } else {
            resolve(buffer);
        }
    });
}

function handleGeoStyleResponse(proxyRes: IncomingMessage, res: ServerResponse, origin: string): void {
    const chunks: Buffer[] = [];
    proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
    proxyRes.on("end", () => {
        const buffer = Buffer.concat(chunks);

        if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(buffer);
            return;
        }

        decompressBuffer(buffer, proxyRes.headers["content-encoding"])
            .then((decompressed) => {
                const rewrittenBody = rewriteLocationStyleResponse(decompressed, origin);
                res.setHeader("content-type", "application/json");
                res.end(rewrittenBody);
            })
            .catch((error) => {
                console.error("[devServer] Failed to rewrite geo style response", error);
                res.writeHead(500, { "content-type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to rewrite geo style response." }));
            });
    });
}

function createGeoStyleProxyOptions({ backend, origin }: { backend: string; origin: string }): ProxyOptions {
    return {
        target: backend,
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
        headers: {
            host: backend,
            "X-Requested-With": "XMLHttpRequest",
        },
        selfHandleResponse: true,
        configure: (proxy) => {
            proxy.on("proxyReq", handleProxyRequest);
            proxy.on("proxyRes", (proxyRes: IncomingMessage, _req, res: ServerResponse) => {
                handleGeoStyleResponse(proxyRes, res, origin);
            });
        },
    };
}

function makePackageEsmAlias(packageName: string) {
    // In scss file there are links to esm files, this fix icon loading
    // for these icon imports
    // @example
    // background-image: url("@gooddata/sdk-ui-kit/esm/assets/loading.svg");
    return {
        find: `${packageName}/esm`,
        replacement: path.resolve(__dirname, `./../../libs/${packageName.split("/")[1]}/esm`),
    };
}

function makePackageSourceAlias(packageName: string) {
    return {
        find: packageName,
        replacement: path.resolve(__dirname, `./../../libs/${packageName.split("/")[1]}/src`),
    };
}

function makePackageStylesAlias(packageName: string) {
    return {
        find: `${packageName}/styles`,
        replacement: path.resolve(__dirname, `./../../libs/${packageName.split("/")[1]}/styles`),
    };
}

// Define the directory to store certificates
const certDir = path.join(process.env["HOME"] || process.env["USERPROFILE"], ".gooddata", "certs");
let httpsOptions: ServerOptions["https"] | undefined;

try {
    httpsOptions = {
        ca: fs.readFileSync(path.join(certDir, "rootCA.pem")),
        key: fs.readFileSync(path.join(certDir, "localhost-key.pem")),
        cert: fs.readFileSync(path.join(certDir, "localhost-cert.pem")),
    };
} catch {
    // Certificates not found - fall back to HTTP
}

const serverOptions = httpsOptions ? { https: httpsOptions } : {};

// https://vitejs.dev/config/
// eslint-disable-next-line no-restricted-exports
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const backendUrl = env["VITE_BACKEND_URL"] ?? "https://staging.dev-latest.stg11.panther.intgdc.com";
    const port = 8999;
    const protocol = httpsOptions ? "https" : "http";
    const devServerOrigin = `${protocol}://localhost:${port}`;

    return {
        plugins: [react()],
        build: {
            chunkSizeWarningLimit: 15000, // Increased to suppress warnings for large chunks
        },
        optimizeDeps: {
            exclude: [
                "@codemirror/state",
                "@codemirror/view",
                ...packagesWithoutStyles,
                ...packagesWithStyles,
            ],
        },
        resolve: {
            alias: [
                // This is required to make fonts work
                {
                    find: "@gooddata/sdk-ui-kit/src/@ui",
                    replacement: path.resolve(__dirname, "./../../libs/sdk-ui-kit/src/@ui"),
                },
                ...packagesWithoutStyles.map(makePackageSourceAlias),
                ...packagesWithStyles.flatMap((pkg) => [
                    makePackageEsmAlias(pkg),
                    makePackageStylesAlias(pkg),
                    makePackageSourceAlias(pkg),
                ]),
            ],
            dedupe: ["@codemirror/state", "@codemirror/view"],
        },
        server: {
            ...serverOptions,
            port,
            fs: {
                strict: false,
            },
            proxy: {
                [GEO_STYLE_ENDPOINT]: createGeoStyleProxyOptions({
                    backend: backendUrl,
                    origin: devServerOrigin,
                }),
                "/api": {
                    changeOrigin: true,
                    cookieDomainRewrite: "localhost",
                    secure: false,
                    target: backendUrl,
                    headers: {
                        host: backendUrl,
                        // origin: null,
                    },
                    configure: (proxy) => {
                        proxy.on("proxyReq", handleProxyRequest);
                    },
                },
            },
        },
    };
});
