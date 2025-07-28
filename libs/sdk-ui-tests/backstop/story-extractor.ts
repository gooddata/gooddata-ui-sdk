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
        // Import your existing toBackstopJson function via Vite's SSR loader
        const modulePath = resolve(__dirname, "../stories/_infra/toBackstop.ts");
        const toBackstop = await server.ssrLoadModule(modulePath);

        // Call the function exactly as before
        const json = await toBackstop.toBackstopJson();

        writeFileSync("./backstop/stories.json", json, "utf-8");
        console.log("✅ stories.json written");

        await server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to generate JSON:", err);
        await server.close();
        process.exit(1);
    }
})();
