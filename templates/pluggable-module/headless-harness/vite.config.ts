// (C) 2026 GoodData Corporation

import { readFileSync } from "fs";
import { join, resolve } from "path";

import { type ServerOptions, type UserConfig, defaultClientConditions, defineConfig, loadEnv } from "vite";

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
    // oxlint-disable-next-line eslint-js/no-console
    console.info(`No certificates found in ${certDir}, skipping HTTPS configuration`);
    httpsConfig = undefined;
}

function parseModuleConfig(value: string | undefined): Record<string, unknown> {
    if (!value) {
        return {};
    }
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("HEADLESS_MODULE_CONFIG in .env must be a JSON object.");
    }
    return parsed as Record<string, unknown>;
}

export default defineConfig(({ mode }): UserConfig => {
    const env = loadEnv(mode, process.cwd(), "");
    const isProduction = mode === "production";
    // @gooddata/create-pluggable-module's computeDevPort() matches this line shape
    // (`env["PORT"] || "NNNN"`) to pick a free port for the next scaffolded module.
    const port = parseInt(env["PORT"] || "{harnessPort}");

    return {
        root: ".",
        publicDir: false,
        define: {
            HEADLESS_MODULE_CONFIG: JSON.stringify(parseModuleConfig(env["HEADLESS_MODULE_CONFIG"])),
            // The harness bundles the module source, which reads these build-time values.
            __BUILD_TIMESTAMP__: JSON.stringify(Date.now()),
            __ALLOWED_ORGANIZATIONS__: "[]",
        },
        resolve: {
            // resolve.conditions replaces Vite's defaults, so keep them and add `source` in dev only.
            conditions: [...defaultClientConditions, ...(isProduction ? [] : ["source"])],
        },
        server: {
            port,
            https: httpsConfig,
            fs: {
                allow: ["../../../"],
            },
        },
        build: {
            outDir: "dist",
            sourcemap: !isProduction,
            target: "es2022",
            rolldownOptions: {
                input: resolve(import.meta.dirname, "index.html"),
                checks: {
                    pluginTimings: false,
                },
            },
        },
    };
});
