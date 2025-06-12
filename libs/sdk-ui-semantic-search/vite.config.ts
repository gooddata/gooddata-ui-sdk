// (C) 2023-2024 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: "./setupTests.ts",
    },
});
