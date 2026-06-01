// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    test: {
        environment: "happy-dom",
        include: ["src/**/*.test.{ts,tsx}"],
        globals: true,
    },
});
