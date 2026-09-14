// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        reporters: ["default"],
        isolate: false,
        clearMocks: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
});
