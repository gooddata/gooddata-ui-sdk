// (C) 2023 GoodData Corporation
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: "./setupTests.ts",
    },
});
