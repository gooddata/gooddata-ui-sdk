// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// Note: all unit tests which iterate on scenarios are skipped, as neoBackstop is now voting on pre-merge

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    test: {
        environment: "happy-dom",
        setupFiles: "./vitest.setup.ts",
        fileParallelism: false,
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        isolate: true,
        maxConcurrency: 8, // Concurrency for CI
        // Disable slow operations when not needed
        globals: false,
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
