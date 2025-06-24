// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "happy-dom",
        setupFiles: "./setupTests.ts",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        exclude: ["**/node_modules/**", "**/esm/**"],

        // Performance optimizations (conservative approach)
        pool: "threads",
        poolOptions: {
            threads: {
                // Keep isolation enabled for test stability
                singleThread: false,
            },
        },
        // Skip CSS processing to improve transform speed
        css: false,
    },
});
