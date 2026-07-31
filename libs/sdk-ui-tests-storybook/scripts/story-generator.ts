// (C) 2025-2026 GoodData Corporation

import { resolve } from "path";

import { createServer, createServerModuleRunner } from "vite";

import "./mockWindow.js";

const server = await createServer({
    server: { middlewareMode: true },
    configFile: "./vite.config.ts",
});

const runner = createServerModuleRunner(server.environments.ssr);

try {
    await runner.import(resolve(import.meta.dirname, "../stories/_infra/generateInsightStories"));
    await runner.import(resolve(import.meta.dirname, "../stories/_infra/generateScenarioStories"));

    await server.close();
    process.exit(0);
} catch (err) {
    console.error("❌ Failed to generate stories:", err);
    await server.close();
    process.exit(1);
}
