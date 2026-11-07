// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

import { DESKTOP_VIEWPORT } from "./test/viewport.js";

export default defineConfig({
    define: {
        PRODUCTION: JSON.stringify(false),
    },
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        include: ["src/**/*.test.{ts,tsx}"],
        pool: "threads",
        maxWorkers: 8,
        isolate: false,
        clearMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        maxConcurrency: 8,
        environmentOptions: {
            // Vitest only reads happyDOM, not happy-dom
            happyDOM: DESKTOP_VIEWPORT,
        },
    },
});
