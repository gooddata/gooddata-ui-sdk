// (C) 2007-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        // Use happy-dom for faster performance than jsdom
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        include: ["src/**/*.test.{ts,tsx}"],
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
        clearMocks: true,
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
    define: {
        READONLY_MODE: false,
        COMMITHASH: '"dev"',
        DEBUG: false,
        TESTING: true,
        TIGER_API_TOKEN: false,
    },
});
