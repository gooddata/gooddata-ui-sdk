// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vitest/config";

// Plugin to handle CSS module imports
const cssModulesPlugin = {
    name: "css-modules",
    resolveId(id) {
        if (id.endsWith(".module.scss.js")) {
            // Return a virtual module ID
            return "\0" + id;
        }
    },
    load(id) {
        if (id.startsWith("\0") && id.endsWith(".module.scss.js")) {
            // Return a Proxy that returns the property name as the value
            return `export default new Proxy({}, {
                get: (target, prop) => String(prop),
            })`;
        }
    },
};

export default defineConfig({
    plugins: [cssModulesPlugin],
    test: {
        environment: "happy-dom",
        setupFiles: "./vitest.setup.ts",
        pool: "threads",
        poolOptions: {
            threads: {
                maxThreads: 8,  // Thread count for CI
                minThreads: 4,
            },
        },
        // Improve performance with these options
        isolate: true,
        maxConcurrency: 8,      // Concurrency for CI
        // Disable slow operations when not needed
        globals: false,
        // Speed up test runs by avoiding unnecessary operations
        environmentOptions: {
            "happy-dom": {
                url: "http://localhost",
                // Disable features not needed for tests
                features: {
                    FetchAPI: false,
                    WebSocket: false,
                    ProcessExternalResources: false
                }
            },
        }
    },
});
