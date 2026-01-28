// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    resolve: {
        preserveSymlinks: true,
    },
    test: {
        setupFiles: "./vitest.setup.ts",
    },
});
