// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    test: {
        include: ["**/tests/integrated/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        setupFiles: "./integrated-test.setup.js",
        testTimeout: 40000,
    },
});
