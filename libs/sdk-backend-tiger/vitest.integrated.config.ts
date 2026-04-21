// (C) 2023-2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    test: {
        include: ["**/tests/integrated/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        testTimeout: 40000,
    },
});
