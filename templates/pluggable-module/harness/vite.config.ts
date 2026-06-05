// (C) 2026 GoodData Corporation

import { readFileSync } from "fs";
import type { ClientRequest } from "http";
import { join, resolve } from "path";

import react from "@vitejs/plugin-react";
import { type ServerOptions, type UserConfig, defaultClientConditions, defineConfig, loadEnv } from "vite";

// Strip `origin` (Tiger backend rejects cross-origin) and force identity
// encoding (so the vite proxy can read the response without decompressing).
function applyProxyRequestHeaders(proxyReq: ClientRequest): void {
    proxyReq.removeHeader("origin");
    proxyReq.setHeader("accept-encoding", "identity");
}

const certDir = join(process.env["HOME"] || process.env["USERPROFILE"] || "", ".gooddata", "certs");
let httpsConfig: ServerOptions["https"] | undefined;

try {
    httpsConfig = {
        ca: readFileSync(join(certDir, "rootCA.pem")),
        key: readFileSync(join(certDir, "localhost-key.pem")),
        cert: readFileSync(join(certDir, "localhost-cert.pem")),
    };
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
} catch (e) {
    // eslint-disable-next-line no-console
    console.info(`No certificates found in ${certDir}, skipping HTTPS configuration`);
    httpsConfig = undefined;
}

// eslint-disable-next-line no-restricted-exports
export default defineConfig(({ mode }): UserConfig => {
    const env = loadEnv(mode, process.cwd(), "");
    const isProduction = mode === "production";
    // NOTE: @gooddata/create-pluggable-module's computeDevPort() regex-matches
    // this line shape (`env["PORT"] || "NNNN"`) when scanning existing harnesses
    // to pick a port for the next scaffolded app. If you refactor it, update
    // sdk/tools/create-pluggable-module/src/engine/derived.ts to match.
    const port = parseInt(env["PORT"] || "{harnessPort}");
    const backend = env["BACKEND_URL"];
    if (!isProduction && !backend) {
        throw new Error(
            "BACKEND_URL is required for the dev server. Copy .env.template to .env and set BACKEND_URL " +
                "to the URL of your GoodData Cloud instance (e.g. https://yourorg.gooddata.com).",
        );
    }

    return {
        root: ".",
        base: isProduction ? "/{applicationTemplateScope}/" : "/",
        publicDir: false,
        define: {
            SDK_BACKEND: JSON.stringify("tiger"),
            TIGER_API_TOKEN: isProduction ? undefined : JSON.stringify(env["TIGER_API_TOKEN"]),
            PRODUCTION: JSON.stringify(isProduction),
            APP_TEMPLATE_REMOTE_URL: isProduction
                ? "undefined"
                : env["APP_TEMPLATE_REMOTE_URL"]
                  ? JSON.stringify(env["APP_TEMPLATE_REMOTE_URL"])
                  : "undefined",
            "process.env": JSON.stringify({}),
            REACT_APP_SDK_BACKEND: JSON.stringify("TIGER"),
            REACT_APP_API_TOKEN: isProduction ? undefined : JSON.stringify(env["TIGER_API_TOKEN"]),
            REACT_APP_IN_AIO: JSON.stringify(false),
        },
        plugins: [react()],
        resolve: {
            // resolve.conditions REPLACES Vite's defaults rather than extending them
            // (Vite 8's mergeWithDefaultsRecursively assigns arrays directly), so we must
            // spread defaultClientConditions to keep "browser" / "module" / dev-prod
            // resolution. Without "browser", packages like react-textarea-autosize fall
            // through to their node-targeted default export (a stub that ignores
            // minRows/maxRows).
            // `source` is added only in dev so production builds use the published
            // artifacts of workspace deps, not their TS source.
            conditions: [...defaultClientConditions, ...(isProduction ? [] : ["source"])],
            dedupe: ["react", "react-dom"],
        },
        server: {
            port,
            https: httpsConfig,
            proxy: {
                "/api": {
                    changeOrigin: true,
                    cookieDomainRewrite: "localhost",
                    secure: false,
                    target: backend,
                    headers: {
                        host: backend,
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    configure: (proxy) => {
                        proxy.on("proxyReq", applyProxyRequestHeaders);
                    },
                },
            },
            fs: {
                allow: ["../../../"],
            },
        },
        build: {
            outDir: "dist",
            sourcemap: !isProduction,
            target: "es2022",
            chunkSizeWarningLimit: 10000,
            rolldownOptions: {
                input: resolve(__dirname, "index.html"),
            },
        },
    };
});
