// (C) 2026 GoodData Corporation

import { globSync } from "node:fs";
import { basename } from "node:path";

import { defineConfig } from "rolldown";

const testFiles = globSync("playwright/tests/**/*.spec.ts");

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    input: {
        "playwright.config": "playwright/playwright.config.ts",
        ...Object.fromEntries(testFiles.map((f) => [`tests/${basename(f, ".ts")}`, f])),
    },
    output: {
        dir: "dist",
        format: "esm",
        entryFileNames: "[name].mjs",
        chunkFileNames: "chunks/[name]-[hash].mjs",
    },
    external: [
        /^@playwright\/test$/,
        /^node:/,
        "path",
        "url",
        "fs",
        "crypto",
        "os",
        "child_process",
        "stream",
        "http",
        "https",
        "net",
        "tls",
        "events",
        "buffer",
        "util",
        "assert",
        "zlib",
    ],
    platform: "node",
    treeshake: true,
});
