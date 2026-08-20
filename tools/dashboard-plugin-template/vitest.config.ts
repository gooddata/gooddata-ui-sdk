// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        reporters: ["default"],
        isolate: false,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
});
