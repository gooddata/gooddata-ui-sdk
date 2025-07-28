// (C) 2025 GoodData Corporation

import { createServer } from "vite";
import { writeFileSync } from "fs";
import { resolve } from "path";

import "./mockWindow.js";

(async () => {
    // Create vite server in middleware mode for SSR
    const server = await createServer({
        server: { middlewareMode: true },
        configFile: "./vite.config.ts",
    });

    try {
        await server.ssrLoadModule(resolve(__dirname, "../stories/_infra/generateInsightStories"));
        await server.ssrLoadModule(resolve(__dirname, "../stories/_infra/generateScenarioStories"));

        // Call the function exactly as before
        console.log("✅ stories generated");

        await server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to generate stories:", err);
        await server.close();
        process.exit(1);
    }
})();
