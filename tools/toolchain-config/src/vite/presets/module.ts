// (C) 2026 GoodData Corporation

import { resolve } from "node:path";

import type { ModuleFederationOptions } from "@module-federation/vite";
import { loadEnv } from "vite";

import { readPackageName } from "../../shared/paths.js";
import { STATIC_OUTPUT_FILE_NAMES, resolvePort } from "../parts/buildOutput.js";
import { clientConditions } from "../parts/conditions.js";
import { moduleDefines } from "../parts/define.js";
import { federationRemote } from "../parts/federationRemote.js";
import { devServerHttps } from "../parts/https.js";
import { reactPlugin } from "../parts/react.js";
import { NO_PLUGIN_TIMINGS, WORKER_NO_PLUGIN_TIMINGS } from "../parts/rolldownChecks.js";
import { CSS_QUIET_DEPS } from "../parts/scss.js";
import { gitRevisionPlugin } from "../plugins/gitRevision.js";

import { createVitePreset } from "./createPreset.js";

/**
 * Packages the hosts and every module must share one instance of.
 */
export const DEFAULT_MODULE_DEDUPE: string[] = [
    "@gooddata/sdk-ui",
    "@gooddata/sdk-ui-kit",
    "@gooddata/sdk-ui-ext",
    "react",
    "react-dom",
];

/**
 * The federation container name of a module package: `gdc-catalog-module` becomes `gdc_catalog`.
 * Mirrors the scaffolder's derivation, so the name the hosts hardcode is the one the module builds.
 */
export function federationNameFromPackage(packageName = readPackageName()): string {
    return packageName.replace(/-module$/, "").replaceAll("-", "_");
}

/**
 * Options for the {@link module} preset.
 */
export interface IModuleOptions {
    /**
     * Federation container name. Defaults to {@link federationNameFromPackage} of the package.
     */
    name?: string;

    /**
     * `vite preview` port when `PORT` is not set. The hosts expect the remote on it in local dev.
     */
    port?: number;

    /**
     * Federation entry, relative to the package root. Defaults to `src/pluggableApp.tsx`.
     */
    entry?: string;

    /**
     * Exposed modules. Defaults to exposing the entry as `./pluggableApp`.
     */
    exposes?: Record<string, string>;

    /**
     * Further `@module-federation/vite` options, e.g. `shared` and `shareStrategy` for a remote that
     * populates the share scope.
     */
    federation?: Partial<ModuleFederationOptions>;

    /**
     * Packages deduplicated to one instance. Defaults to {@link DEFAULT_MODULE_DEDUPE}.
     */
    dedupe?: string[];
}

/**
 * Vite preset for a pluggable module: the Module Federation remote build (`remoteEntry.js` plus the
 * pluggableApp chunks) the hosts load via `@module-federation/runtime`. With `base: "./"` the same
 * `dist/` serves from the host nginx or from S3.
 *
 * Local dev: `vite build --watch` and `vite preview` in two terminals. Day-to-day development is
 * faster via the sibling harness, which imports the module source directly without federation.
 *
 * @example
 * ```ts
 * // modules/gdc-catalog/module/vite.config.ts
 * import { presets } from "@gooddata/toolchain-config/vite";
 *
 * export default presets.module({ port: 8551 });
 * ```
 */
export const module = createVitePreset(
    ({
        name = federationNameFromPackage(),
        port,
        entry = "src/pluggableApp.tsx",
        exposes = { "./pluggableApp": `./${entry}` },
        federation,
        dedupe = DEFAULT_MODULE_DEDUPE,
    }: IModuleOptions) =>
        async ({ mode, command }) => {
            const env = loadEnv(mode, process.cwd(), "");
            const isDev = command === "serve";

            return {
                root: ".",
                // Relative base so asset URLs resolve via import.meta.url at runtime, allowing the
                // remote to be served from any path (nginx, S3, CDN) without coupling to a host URL.
                base: "./",
                publicDir: false,
                resolve: {
                    conditions: clientConditions({ source: isDev }),
                    dedupe,
                },
                define: moduleDefines(mode),
                // `vite preview` serves dist/ for local dev against the host app. cors lets the
                // harness and host fetch remoteEntry.js cross-origin.
                preview: {
                    port: resolvePort(env["PORT"], port),
                    https: devServerHttps(),
                    cors: true,
                },
                css: CSS_QUIET_DEPS,
                worker: WORKER_NO_PLUGIN_TIMINGS,
                build: {
                    outDir: "dist",
                    sourcemap: mode !== "production",
                    target: "es2022",
                    chunkSizeWarningLimit: 10000,
                    rolldownOptions: {
                        input: resolve(process.cwd(), entry),
                        output: STATIC_OUTPUT_FILE_NAMES,
                        checks: NO_PLUGIN_TIMINGS,
                    },
                },
                plugins: [
                    await federationRemote({ name, exposes, options: federation }),
                    await reactPlugin(),
                    gitRevisionPlugin(),
                ],
            };
        },
);
