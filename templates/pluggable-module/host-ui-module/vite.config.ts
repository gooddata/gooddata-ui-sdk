// (C) 2026 GoodData Corporation

//
// Builds the Module Federation artifacts (remoteEntry.js + hostUiModule chunks) that the host loads
// in place of its default header, navigation and layout. With `base: "./"` the same dist/ works from
// any path, for example from S3: https://<bucket>/<prefix>/gdc-host-ui-template-name/remoteEntry.js
//
// Build:      `vite build` → dist/
// Local dev:  `vite build --watch` and `vite preview` (see the `dev` script). Day-to-day development
//             is faster in the sibling harness/, which imports the module source directly.
//
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
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

function parseAllowedOrganizations(value: string | undefined): string[] {
    return (value ?? "")
        .split(",")
        .map((organizationId) => organizationId.trim())
        .filter((organizationId) => organizationId.length > 0);
}

export default defineConfig(({ mode, command }): UserConfig => {
    const env = loadEnv(mode, process.cwd(), "");
    const port = parseInt(env["PORT"] || "{modulePort}");
    const isDev = command === "serve";

    return {
        root: ".",
        base: "./",
        publicDir: false,
        resolve: {
            // resolve.conditions replaces Vite's defaults, so keep them and add `source` in dev only.
            conditions: [...defaultClientConditions, ...(isDev ? ["source"] : [])],
            dedupe: ["react", "react-dom"],
        },
        define: {
            "process.env": JSON.stringify({}),
            __BUILD_TIMESTAMP__: JSON.stringify(Date.now()),
            __ALLOWED_ORGANIZATIONS__: JSON.stringify(
                parseAllowedOrganizations(env["ALLOWED_ORGANIZATIONS"]),
            ),
        },
        preview: {
            port,
            https: httpsConfig,
            cors: true,
        },
        build: {
            outDir: "dist",
            sourcemap: mode !== "production",
            target: "es2022",
            rolldownOptions: {
                input: resolve(import.meta.dirname, "src/hostUiModule.tsx"),
                output: {
                    entryFileNames: "static/js/[name].[hash].js",
                    chunkFileNames: "static/js/[name].[hash].chunk.js",
                    assetFileNames: "static/[hash][extname]",
                },
                checks: {
                    pluginTimings: false,
                },
            },
        },
        plugins: [
            federation({
                name: "{applicationTemplateFederationName}",
                filename: "remoteEntry.js",
                manifest: true,
                publicPath: "auto",
                dts: false,
                exposes: {
                    "./hostUiModule": "./src/hostUiModule.tsx",
                },
                // The module bundles its own React. The host mounts it into its own container.
                shared: [],
                moduleParseIdleTimeout: 60,
            }),
            react(),
        ],
    };
});
