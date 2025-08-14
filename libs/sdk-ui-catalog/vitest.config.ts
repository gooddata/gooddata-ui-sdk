// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: "./vitest.setup.ts",
    },
});
