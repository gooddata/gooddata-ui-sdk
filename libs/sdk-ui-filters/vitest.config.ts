// (C) 2023-2026 GoodData Corporation

import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
// Realpath into the pnpm store, so everything @rc-component/picker's CJS build requires resolves from
// the store — `resolve.preserveSymlinks` below would otherwise strand its nested deps (clsx, trigger, ...).
// require.resolve picks the exports map's "require" condition, i.e. the lib/ CJS entry.
const rcPickerLibDir = dirname(realpathSync(require.resolve("@rc-component/picker")));

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    resolve: {
        preserveSymlinks: true,
        alias: [
            // @rc-component/picker's "es" build ships ESM syntax in .js files without `"type": "module"`:
            // Node cannot import it natively (extensionless relative imports), and vite cannot inline it
            // under `preserveSymlinks` (its bare imports like clsx are not this package's direct deps).
            // Point the component entry points at the lib/ CJS build instead — vitest externalizes it and
            // Node's require chain resolves everything through the store. Locale subpaths stay un-aliased
            // and inline fine (relative imports only).
            { find: /^@rc-component\/picker$/, replacement: join(rcPickerLibDir, "index.js") },
            {
                find: /^@rc-component\/picker\/generate\/moment$/,
                replacement: join(rcPickerLibDir, "generate/moment.js"),
            },
        ],
    },
    test: {
        // Use happy-dom for faster performance than jsdom
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        env: { NODE_ENV: "test" },
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        // Improve performance with these options
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
        mockReset: true,
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
        // Speed up test runs by avoiding unnecessary operations
        environmentOptions: {
            "happy-dom": {
                url: "http://localhost",
                // Disable features not needed for tests
                features: {
                    FetchAPI: false,
                    WebSocket: false,
                    ProcessExternalResources: false,
                },
            },
        },
    },
});
