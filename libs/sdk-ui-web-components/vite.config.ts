// (C) 2022-2025 GoodData Corporation
import { defineConfig, loadEnv } from "vite";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import environment from "vite-plugin-environment";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const require = createRequire(import.meta.url);
const npmPackage = require("./package.json");
const sdkModelDependency = npmPackage.dependencies?.["@gooddata/sdk-model"] ?? "";
const sdkModelVersion = sdkModelDependency.replace(/[\^~]/, "");

const projectDir = dirname(fileURLToPath(import.meta.url));
export default defineConfig(({ command, mode }) => {
    // Load env file based on `mode` in the current working directory.
    const env = loadEnv(mode, projectDir, "");

    const debugDir = resolve(projectDir, "debug");
    const assetDir = resolve(projectDir, "esm");

    // this is config for the debug server
    if (command === "serve") {
        return {
            plugins: [
                environment({
                    NODE_DEBUG: "",
                    TEST_PSEUDOMAP: "",
                }),
                {
                    name: "inject-insight-id",
                    transformIndexHtml(html) {
                        return html.replaceAll("{__variable__}", env["VITE_INSIGHT"]);
                    },
                },
            ],
            define: {
                NPM_PACKAGE_NAME: JSON.stringify(npmPackage.name),
                NPM_PACKAGE_VERSION: JSON.stringify(sdkModelVersion),
                // Make environment variables available to the client
                VITE_BACKEND_URL: JSON.stringify(env["VITE_BACKEND_URL"]),
                VITE_WORKSPACE: JSON.stringify(env["VITE_WORKSPACE"]),
                VITE_INSIGHT: JSON.stringify(env["VITE_INSIGHT"]),
                VITE_AUTH_TOKEN: JSON.stringify(env["VITE_AUTH_TOKEN"]),
                'process.env': {NODE_ENV:mode},
            },
            root: debugDir,
            publicDir: false,
            server: {
                port: 9999,
                open: "/index.html",
                fs: {
                    allow: [debugDir, projectDir],
                },
            },
            preview: {
                open: "/index.html",
            },
        };
    }

    // this is config for the build
    return {
        plugins: [
            environment({
                NODE_DEBUG: "",
                TEST_PSEUDOMAP: "",
            }),
            cssInjectedByJsPlugin({
                jsAssetsFilterFunction: (chunk) => /^index\.js$/.test(chunk.fileName),
            }),
        ],
        define: {
            NPM_PACKAGE_NAME: JSON.stringify(npmPackage.name),
            NPM_PACKAGE_VERSION: JSON.stringify(sdkModelVersion),
            'process.env': {NODE_ENV:mode},
        },
        build: {
            minify: mode === "production" ? true : false,
            sourcemap: mode === "development" ? true : false,
            lib: {
                entry: {
                    index: resolve(projectDir, "src", "index.ts"),
                    tigerBackend: resolve(projectDir, "src", "tigerBackend.ts"),
                },
                formats: ["es"],
                fileName: (_format, entryName) => `${entryName}.js`,
            },
            rollupOptions: {
                onwarn(warning, warn) {
                    // Suppress "use client" directive warnings
                    if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                        return;
                    }
                    warn(warning);
                },
                output: {
                    dir: assetDir,
                    entryFileNames: "[name].js",
                    chunkFileNames: "[hash].js",
                },
            },
        },
    };
});
