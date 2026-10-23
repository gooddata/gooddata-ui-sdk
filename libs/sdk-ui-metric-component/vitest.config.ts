// (C) 2021-2026 GoodData Corporation

import { readFileSync } from "fs";

import { defineConfig } from "vitest/config";

export default defineConfig({
    // exclude monaco-editor from optimization to prevent source map loading errors in test runs
    optimizeDeps: {
        exclude: ["monaco-editor"],
    },
    // also add plugin to strip source map references from monaco-editor files before Vite processes them
    plugins: [
        {
            name: "strip-monaco-sourcemaps",
            enforce: "pre",
            load(id) {
                if (id.includes("monaco-editor") && (id.endsWith(".js") || id.endsWith(".mjs"))) {
                    try {
                        const code = readFileSync(id, "utf-8");
                        if (code.includes("sourceMappingURL")) {
                            return {
                                code: code.replace(/\/\/# sourceMappingURL=.*/g, ""),
                                map: null,
                            };
                        }
                    } catch {
                        // noop
                    }
                }
                return undefined;
            },
        },
    ],
    test: {
        // Use happy-dom for faster performance than jsdom
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        include: ["src/**/*.test.{ts,tsx}"],
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        // Improve performance with these options
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        // Disable slow operations when not needed
        // Speed up test runs by avoiding unnecessary operations
        environmentOptions: {
            "happy-dom": {
                url: "http://localhost",
                // Disable features not needed for tests
                features: {
                    FetchAPI: false,
                    WebSocket: false,
                    ProcessExternalResources: false,
                },
            },
        },
    },
});
