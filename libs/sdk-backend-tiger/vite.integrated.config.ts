// (C) 2023 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["**/tests/integrated/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        setupFiles: "./integrated-test.setup.js",
        testTimeout: 20000,
    },
});
