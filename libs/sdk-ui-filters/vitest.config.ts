// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        // Use happy-dom for faster performance than jsdom
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        env: { NODE_ENV: "test" },
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        // Improve performance with these options
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
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
