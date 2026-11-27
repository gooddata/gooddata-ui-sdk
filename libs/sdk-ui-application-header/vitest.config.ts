// (C) 2007-2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

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
        projects: [
            {
                extends: true,
                test: {
                    name: "non-isolated",
                    include: ["src/**/*.test.{ts,tsx}"],
                    exclude: [...configDefaults.exclude, "src/**/*.isolated.test.{ts,tsx}"],
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    name: "isolated",
                    include: ["src/**/*.isolated.test.{ts,tsx}"],
                    isolate: true,
                },
            },
        ],
    },
});
