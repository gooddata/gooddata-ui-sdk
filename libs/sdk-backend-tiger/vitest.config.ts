// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        include: ["**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        isolate: false,
        clearMocks: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
});
