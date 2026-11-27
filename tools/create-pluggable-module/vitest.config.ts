// (C) 2026 GoodData Corporation

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        reporters: ["default"],
        // Restrict test discovery to src/. Without this, vitest also picks up
        // compiled tests in esm/, doubling the run and producing duplicate
        // snapshot files.
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
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
