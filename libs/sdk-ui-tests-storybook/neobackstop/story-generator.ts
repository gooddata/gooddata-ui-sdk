// (C) 2025-2026 GoodData Corporation

import { resolve } from "path";

import { createServer } from "vite";

import "./mockWindow.js";

// Create vite server in middleware mode for SSR
const server = await createServer({
    server: { middlewareMode: true },
    configFile: "./vite.config.ts",
});

try {
    await server.ssrLoadModule(resolve(__dirname, "../stories/_infra/generateInsightStories"));
    await server.ssrLoadModule(resolve(__dirname, "../stories/_infra/generateScenarioStories"));

    await server.close();
    process.exit(0);
} catch (err) {
    console.error("❌ Failed to generate stories:", err);
    await server.close();
    process.exit(1);
}
