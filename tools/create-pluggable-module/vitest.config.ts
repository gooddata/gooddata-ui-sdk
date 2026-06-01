// (C) 2026 GoodData Corporation

import { defineConfig } from "vitest/config";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    test: {
        // Restrict test discovery to src/. Without this, vitest also picks up
        // compiled tests in esm/, doubling the run and producing duplicate
        // snapshot files.
        include: ["src/**/*.test.{ts,tsx}"],
    },
});
