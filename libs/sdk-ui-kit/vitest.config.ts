// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

import { DESKTOP_VIEWPORT } from "./test/viewport.js";

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
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        environmentOptions: {
            // Vitest only reads happyDOM, not happy-dom
            happyDOM: DESKTOP_VIEWPORT,
        },
    },
});
