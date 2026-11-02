// (C) 2025-2026 GoodData Corporation

import type { ClientRequest, IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import zlib from "node:zlib";

import { type ProxyOptions } from "vite";

const gunzip = promisify(zlib.gunzip);
const brotliDecompress = promisify(zlib.brotliDecompress);
const inflate = promisify(zlib.inflate);

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

/**
 * Vite proxy key (a regex string) matching only the geo style endpoint itself, not the
 * `/api/v1/location/styles/{id}/tiles|sprite|glyphs` sub-paths.
 */
export const LOCATION_STYLE_ENDPOINT = "^/api/v1/location/style($|\\?)";

/**
 * Request headers every proxy to the Tiger backend needs: strip `origin` (the backend rejects
 * cross-origin requests) and force identity encoding (so the dev server can read the response
 * without decompressing it).
 */
export function applyProxyRequestHeaders(proxyReq: ClientRequest): void {
    proxyReq.removeHeader("origin");
    proxyReq.setHeader("accept-encoding", "identity");
}

/**
 * Options for {@link locationStyleProxy}.
 */
export interface ILocationStyleProxyOptions {
    /**
     * Backend the request is proxied to.
     */
    backend: string;

    /**
     * Origin of the dev server, which replaces the backend origin in the style's URLs.
     */
    root: string;
}

/**
 * Vite proxy for the geo location style endpoint. Swaps the backend origin in the style's glyph and
 * tile URLs for the dev server origin, so MapLibre fetches them through the proxy instead of
 * cross-origin.
 */
export function locationStyleProxy({ backend, root }: ILocationStyleProxyOptions): ProxyOptions {
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
            proxy.on("proxyReq", applyProxyRequestHeaders);
            proxy.on("proxyRes", (proxyRes, _req, res) => {
                void rewriteProxiedStyle(proxyRes, res, root);
            });
        },
    };
}

async function rewriteProxiedStyle(
    proxyRes: IncomingMessage,
    res: ServerResponse,
    root: string,
): Promise<void> {
    let buffer: Buffer;
    try {
        buffer = await readBody(proxyRes);
    } catch (error) {
        // An upstream stream error (e.g. a connection reset) must answer the client and must not
        // escape as an unhandled rejection, which would take the dev server down.
        // oxlint-disable-next-line eslint-js/no-console
        console.error("[devServer] Failed to read geo style response", error);
        res.writeHead(502, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read geo style response." }));
        return;
    }

    if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        res.end(buffer);
        return;
    }

    let decompressed: Buffer;
    try {
        decompressed = await decompress(buffer, proxyRes.headers["content-encoding"]);
    } catch (error) {
        // oxlint-disable-next-line eslint-js/no-console
        console.error("[devServer] Failed to decompress geo style response", error);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to decompress geo style response." }));
        return;
    }

    try {
        res.setHeader("content-type", "application/json");
        res.end(rewriteLocationStyleResponse(decompressed, root));
    } catch (error) {
        // oxlint-disable-next-line eslint-js/no-console
        console.error("[devServer] Failed to rewrite geo style response", error);
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to rewrite geo style response." }));
    }
}

function readBody(message: IncomingMessage): Promise<Buffer> {
    return new Promise((resolvePromise, reject) => {
        const chunks: Buffer[] = [];
        message.on("data", (chunk: Buffer) => chunks.push(chunk));
        message.on("end", () => resolvePromise(Buffer.concat(chunks)));
        message.on("error", reject);
    });
}

function decompress(buffer: Buffer, encoding: string | string[] | undefined): Promise<Buffer> {
    switch (getPrimaryContentEncoding(encoding)) {
        case "gzip":
            return gunzip(buffer);
        case "br":
            return brotliDecompress(buffer);
        case "deflate":
            return inflate(buffer);
        default:
            return Promise.resolve(buffer);
    }
}

function getPrimaryContentEncoding(encoding: string | string[] | undefined): string {
    const headerValue = Array.isArray(encoding) ? encoding.join(",") : (encoding ?? "");
    const [primaryEncoding = ""] = headerValue.split(",");

    return primaryEncoding.split(";")[0]!.trim().toLowerCase();
}

interface IStyleSource {
    type?: string;
    tiles?: unknown;
}

interface IStylePayload {
    glyphs?: unknown;
    sources?: Record<string, IStyleSource | undefined>;
}

function rewriteLocationStyleResponse(buffer: Buffer, origin: string): string {
    const payload = JSON.parse(buffer.toString("utf8")) as IStylePayload;

    if (typeof payload.glyphs === "string") {
        payload.glyphs = replaceUrlOrigin(payload.glyphs, origin);
    }

    // Sprite URLs are intentionally NOT rewritten. The sprite sheet is served by an external tile
    // server and is not proxied through the dev server, so it must keep its original absolute URL.

    if (payload.sources && typeof payload.sources === "object") {
        for (const source of Object.values(payload.sources)) {
            if (isSourceWithTiles(source)) {
                source.tiles = source.tiles.map((tileUrl) => replaceUrlOrigin(tileUrl, origin));
            }
        }
    }

    return JSON.stringify(payload);
}

function replaceUrlOrigin(value: string, origin: string): string {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        return value;
    }

    const originMatch = /^[a-z]+:\/\/[^/]+/i.exec(value);
    if (!originMatch) {
        return `${origin}${value}`;
    }

    return `${origin}${value.slice(originMatch[0].length)}`;
}

function isSourceWithTiles(source: IStyleSource | undefined): source is IStyleSource & { tiles: string[] } {
    return (
        !!source &&
        typeof source === "object" &&
        (source.type === "vector" || source.type === "raster") &&
        Array.isArray(source.tiles)
    );
}
