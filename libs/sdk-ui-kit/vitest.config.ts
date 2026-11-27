// (C) 2023-2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

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
        maxConcurrency: 8, // Concurrency for CI
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        environmentOptions: {
            // Vitest only reads happyDOM, not happy-dom
            happyDOM: DESKTOP_VIEWPORT,
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "non-isolated",
                    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
                    exclude: [...configDefaults.exclude, "**/*.isolated.{test,spec}.?(c|m)[jt]s?(x)"],
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    name: "isolated",
                    include: ["**/*.isolated.{test,spec}.?(c|m)[jt]s?(x)"],
                    isolate: true,
                },
            },
        ],
    },
});
