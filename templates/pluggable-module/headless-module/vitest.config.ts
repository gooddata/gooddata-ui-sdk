// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

export default defineConfig({
    define: {
        __BUILD_TIMESTAMP__: "0",
        __ALLOWED_ORGANIZATIONS__: "[]",
    },
    test: {
        environment: "node",
        reporters: ["default"],
        include: ["src/**/*.test.ts"],
        restoreMocks: true,
    },
});
