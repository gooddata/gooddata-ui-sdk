// (C) 2021-2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "node",

        reporters: ["default"],

        pool: "forks",

        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,

        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/*.d.ts", "src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "non-isolated",
                    include: ["test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
                    exclude: [
                        ...configDefaults.exclude,
                        "test/**/*.isolated.test.{ts,tsx}",
                        "src/**/*.isolated.test.{ts,tsx}",
                    ],
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    name: "isolated",
                    include: ["test/**/*.isolated.test.{ts,tsx}", "src/**/*.isolated.test.{ts,tsx}"],
                    isolate: true,
                },
            },
        ],
    },
});
