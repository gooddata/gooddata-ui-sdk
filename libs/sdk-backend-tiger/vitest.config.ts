// (C) 2023-2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        clearMocks: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        projects: [
            {
                extends: true,
                test: {
                    name: "non-isolated",
                    include: ["**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
                    exclude: [
                        ...configDefaults.exclude,
                        "**/src/**/*.isolated.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
                    ],
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    name: "isolated",
                    include: ["**/src/**/*.isolated.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
                    isolate: true,
                },
            },
        ],
    },
});
