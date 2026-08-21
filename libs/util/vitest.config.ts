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
        isolate: false,
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
});
