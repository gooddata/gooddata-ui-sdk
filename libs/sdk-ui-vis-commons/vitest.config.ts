// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "happy-dom",
        setupFiles: "./setupTests.ts",
    },
});
