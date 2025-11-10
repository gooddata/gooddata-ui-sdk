// (C) 2023-2025 GoodData Corporation

import { dirname, resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        {
            name: "mock-css-modules",
            enforce: "pre",
            // new hook to rewrite .scss.js → .scss
            resolveId(source, importer) {
                if (source.endsWith(".scss.js")) {
                    // convert import path to .scss
                    return resolve(dirname(importer!), source.replace(/\.scss\.js$/, ".scss"));
                }
                // fall back to default Vite resolver
                return null;
            },
        },
    ],
});
