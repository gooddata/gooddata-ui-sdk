// (C) 2023-2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "happy-dom",
        reporters: ["default"],
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
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
