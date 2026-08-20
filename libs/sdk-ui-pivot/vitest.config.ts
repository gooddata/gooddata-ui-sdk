// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

/*
 * The whole suite runs without isolation to keep it fast, so the module graph and the DOM are shared
 * between test files. Keep it that way: a test that needs its own module graph (typically to `vi.mock` a
 * module that other test files import for real) can get one by calling `vi.resetModules()` and importing
 * the module under test dynamically afterwards.
 */
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
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        // Improve performance with these options
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
        clearMocks: true,
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
