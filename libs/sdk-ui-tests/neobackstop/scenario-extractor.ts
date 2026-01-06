// (C) 2025 GoodData Corporation

import { writeFileSync } from "fs";
import { resolve } from "path";

import { createServer } from "vite";

import { storiesToScenarios } from "./scenarios.config.js";

import "./mockWindow.js";

// Create vite server in middleware mode for SSR
const server = await createServer({
    server: { middlewareMode: true },
    configFile: "./vite.config.ts",
});

try {
    // Import your existing toBackstopJson function via Vite's SSR loader
    const modulePath = resolve(__dirname, "../stories/_infra/toBackstop.ts");
    const toBackstop = await server.ssrLoadModule(modulePath);

    // Call the function exactly as before
    const stories = await toBackstop["toBackstopJson"]();

    const scenarios = storiesToScenarios(stories);

    writeFileSync("./neobackstop/scenarios.json", JSON.stringify(scenarios, null, 4), "utf-8");

    await server.close();
    process.exit(0);
} catch (err) {
    console.error("❌ Failed to extract stories to JSON:", err);
    await server.close();
    process.exit(1);
}
