// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    define: {
        PRODUCTION: JSON.stringify(false),
    },
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "happy-dom",
        setupFiles: "./vitest.setup.ts",
        include: ["src/**/*.test.{ts,tsx}"],
        pool: "threads",
        maxWorkers: 8,
        isolate: true,
        maxConcurrency: 8,
        globals: true,
        environmentOptions: {
            "happy-dom": {
                url: "http://localhost",
                features: {
                    FetchAPI: false,
                    WebSocket: false,
                    ProcessExternalResources: false,
                },
            },
        },
    },
});
