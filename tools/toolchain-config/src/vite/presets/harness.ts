// (C) 2026 GoodData Corporation

import { resolve } from "node:path";

import { type ProxyOptions, loadEnv } from "vite";

import { findRepoRoot, readPackageName } from "../../shared/paths.js";
import { backendApiProxy } from "../parts/apiProxy.js";
import { resolvePort } from "../parts/buildOutput.js";
import { clientConditions } from "../parts/conditions.js";
import { harnessDefines } from "../parts/define.js";
import { devServerHttps } from "../parts/https.js";
import { reactPlugin } from "../parts/react.js";
import { NO_PLUGIN_TIMINGS, WORKER_NO_PLUGIN_TIMINGS } from "../parts/rolldownChecks.js";
import { CSS_QUIET_DEPS } from "../parts/scss.js";
import { devAppLoginPlugin } from "../plugins/devAppLogin.js";
import { gooddataSdkSourcePlugin } from "../plugins/gooddataSdkSource.js";
import { LOCATION_STYLE_ENDPOINT, locationStyleProxy } from "../plugins/locationStyleProxy.js";

import { createVitePreset } from "./createPreset.js";

/**
 * The compile-time global carrying a harness's dev remote URL: `gdc-catalog-harness` becomes
 * `CATALOG_REMOTE_URL`. Mirrors the scaffolder's derivation and the host's naming.
 */
export function remoteUrlEnvVarFromPackage(packageName = readPackageName()): string {
    return `${packageName
        .replace(/-harness$/, "")
        .replace(/^gdc-/, "")
        .replaceAll("-", "_")
        .toUpperCase()}_REMOTE_URL`;
}

/**
 * Options for the {@link harness} preset.
 */
export interface IHarnessOptions {
    /**
     * Dev server port when `PORT` is not set. Harness ports mirror the module ports one hundred
     * below, e.g. catalog 8451 and 8551.
     */
    port?: number;

    /**
     * Compile-time global carrying the dev remote URL. Defaults to
     * {@link remoteUrlEnvVarFromPackage} of the package.
     */
    remoteUrlEnvVar?: string;

    /**
     * Where the host serves the app, which is the production `base`. Defaults to `workspace`.
     */
    scope?: "workspace" | "organization";

    /**
     * Backend proxied under `/api` when `BACKEND_URL` is not set. Without either the dev server
     * refuses to start.
     */
    backend?: string;

    /**
     * Also proxy the geo location style endpoint, rewriting its URLs to the dev server origin so
     * MapLibre fetches tiles and glyphs through the proxy. Needs `port`.
     */
    geoStyleProxy?: boolean;
}

/**
 * Vite preset for a module's dev harness: a standalone app that imports the module source directly
 * (no federation), serves the monorepo SDK from source for hot reload, proxies `/api` to a backend,
 * and in production builds the shell the e2e image serves under the host's scope path.
 *
 * @example
 * ```ts
 * // modules/gdc-catalog/harness/vite.config.ts
 * import { presets } from "@gooddata/toolchain-config/vite";
 *
 * export default presets.harness({ port: 8451, backend: "https://staging.example.com" });
 * ```
 */
export const harness = createVitePreset(
    ({
        port,
        remoteUrlEnvVar = remoteUrlEnvVarFromPackage(),
        scope = "workspace",
        backend: backendFallback,
        geoStyleProxy = false,
    }: IHarnessOptions) =>
        async ({ mode }) => {
            const env = loadEnv(mode, process.cwd(), "");
            const isProduction = mode === "production";
            const serverPort = resolvePort(env["PORT"], port);
            const backend = env["BACKEND_URL"] || backendFallback;

            if (!isProduction && !backend) {
                throw new Error(
                    "BACKEND_URL is required for the dev server. Copy .env.template to .env and set BACKEND_URL " +
                        "to the URL of your GoodData Cloud instance (e.g. https://yourorg.gooddata.com).",
                );
            }

            const https = devServerHttps();
            const devServerOrigin = `${https ? "https" : "http"}://localhost:${serverPort}`;

            const proxy: Record<string, ProxyOptions> = {};
            if (backend) {
                if (geoStyleProxy) {
                    proxy[LOCATION_STYLE_ENDPOINT] = locationStyleProxy({ backend, root: devServerOrigin });
                }
                proxy["/api"] = backendApiProxy(backend);
            }

            return {
                root: ".",
                base: isProduction ? `/${scope}/` : "/",
                publicDir: "public",
                define: harnessDefines({ env, isProduction, remoteUrlEnvVar }),
                plugins: [await reactPlugin(), gooddataSdkSourcePlugin(), devAppLoginPlugin()],
                resolve: {
                    conditions: clientConditions({ source: !isProduction }),
                    dedupe: ["react", "react-dom"],
                },
                server: {
                    port: serverPort,
                    https,
                    proxy,
                    fs: {
                        // The SDK source the dev plugin serves lives outside the harness root.
                        allow: [findRepoRoot()],
                    },
                },
                worker: WORKER_NO_PLUGIN_TIMINGS,
                build: {
                    outDir: "dist",
                    sourcemap: !isProduction,
                    target: "es2022",
                    chunkSizeWarningLimit: 15000,
                    rolldownOptions: {
                        input: resolve(process.cwd(), "index.html"),
                        checks: NO_PLUGIN_TIMINGS,
                    },
                },
                css: CSS_QUIET_DEPS,
            };
        },
);
