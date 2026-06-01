// (C) 2026 GoodData Corporation

//
// Pluggable-only build: produces the Module Federation artifacts
// (remoteEntry.js + pluggableApp chunks) needed by the host app.
//
// One artifact, two publish targets: with `base: "./"` the same dist/
// works whether served from host nginx (/organization/remotes/<app>/)
// or from S3 (https://<bucket>/<prefix>/<app>/).
//
// Local dev (module federation):
//   `vite build --watch`   (terminal 1)
//   `vite preview`         (terminal 2)
// Note: day-to-day development is faster via the sibling harness/,
// which imports the module source directly without federation.
//
// Build:
//   `vite build` → dist/
//

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join, resolve } from "path";

import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { type UserConfig, defaultClientConditions, defineConfig, loadEnv } from "vite";

function tryExecSync(command: string, fallback: string): string {
    try {
        return execSync(command, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim() || fallback;
    } catch {
        return fallback;
    }
}

function gitRevisionPlugin() {
    const commitHash = tryExecSync("git rev-parse HEAD --quiet", process.env["GIT_COMMIT"] ?? "dev");

    return {
        name: "git-revision",
        config() {
            return {
                define: {
                    "window.COMMITHASH": JSON.stringify(commitHash),
                },
            };
        },
    };
}

const certDir = join(process.env["HOME"] || process.env["USERPROFILE"] || "", ".gooddata", "certs");
let httpsConfig: import("vite").ServerOptions["https"] | undefined;

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
export default defineConfig(({ mode, command }): UserConfig => {
    const env = loadEnv(mode, process.cwd(), "");
    const port = parseInt(env["PORT"] || "{modulePort}");
    const isDev = command === "serve"; // dev server only

    return {
        root: ".",
        // Relative base so asset URLs resolve via import.meta.url at runtime,
        // allowing the remote to be served from any path (nginx, S3, CDN)
        // without coupling to a specific host URL.
        base: "./",
        publicDir: false,
        resolve: {
            // resolve.conditions REPLACES Vite's defaults rather than extending them
            // (Vite 8's mergeWithDefaultsRecursively assigns arrays directly), so we must
            // spread defaultClientConditions to keep "browser" / "module" / dev-prod
            // resolution. Without "browser", packages like react-textarea-autosize fall
            // through to their node-targeted default export (a stub that ignores
            // minRows/maxRows).
            // `source` is added only in dev so production builds use the published
            // artifacts of workspace deps, not their TS source.
            conditions: [...defaultClientConditions, ...(isDev ? ["source"] : [])],
            dedupe: [
                "@gooddata/sdk-ui",
                "@gooddata/sdk-ui-kit",
                "@gooddata/sdk-ui-ext",
                "react",
                "react-dom",
            ],
        },
        define: {
            REACT_APP_SDK_BACKEND: JSON.stringify("TIGER"),
            PRODUCTION: JSON.stringify(mode === "production"),
            "process.env": JSON.stringify({}),
        },
        // `vite preview` serves dist/ for local dev against the host app.
        preview: {
            port,
            https: httpsConfig,
            cors: true,
        },
        build: {
            outDir: "dist",
            sourcemap: mode !== "production",
            target: "es2022",
            chunkSizeWarningLimit: 10000,
            rolldownOptions: {
                input: resolve(__dirname, "src/pluggableApp.tsx"),
                output: {
                    entryFileNames: "static/js/[name].[hash].js",
                    chunkFileNames: "static/js/[name].[hash].chunk.js",
                    assetFileNames: "static/[hash][extname]",
                },
            },
        },
        plugins: [
            federation({
                name: "{applicationTemplateFederationName}",
                filename: "remoteEntry.js",
                dts: false,
                exposes: {
                    "./pluggableApp": "./src/pluggableApp.tsx",
                },
                // Use idle-based timeout instead of the default 10s absolute deadline,
                // which flakes on loaded CI runners when the transform is slow but progressing.
                moduleParseIdleTimeout: 60,
            }),
            react(),
            gitRevisionPlugin(),
        ],
    };
});
