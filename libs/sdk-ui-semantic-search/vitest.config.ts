// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "happy-dom",
        setupFiles: "./vitest.setup.ts",
        pool: "threads",
        poolOptions: {
            threads: {
                maxThreads: 8,  // Thread count for CI
                minThreads: 4,
            },
        },
        // Improve performance with these options
        isolate: true,
        maxConcurrency: 8,      // Concurrency for CI
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
                    ProcessExternalResources: false
                }
            },
        }
    },
});
