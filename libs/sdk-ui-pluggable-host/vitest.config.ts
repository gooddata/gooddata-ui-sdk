// (C) 2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

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
        pool: "threads",
        maxWorkers: 8,
        clearMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        maxConcurrency: 8,
        environmentOptions: {
            // Vitest only reads happyDOM, not happy-dom
            happyDOM: DESKTOP_VIEWPORT,
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
