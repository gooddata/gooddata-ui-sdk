// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        environment: "happy-dom",
        reporters: ["default"],
        isolate: false,
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
});
