// (C) 2021-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "node",

        reporters: ["default"],

        include: ["test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],

        pool: "forks",

        isolate: false,

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
    },
});
