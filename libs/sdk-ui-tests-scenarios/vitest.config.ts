// (C) 2023-2026 GoodData Corporation

import { URL, fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Note: all unit tests which iterate on scenarios are skipped, as neoBackstop is now voting on pre-merge.
// The smoke-and-capture sweep is skipped too unless GDC_STORE_DEFS is set (populate-ref sets it).

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    resolve: {
        alias: {
            "maplibre-gl": fileURLToPath(new URL("./tests/_infra/maplibre-gl.mock.ts", import.meta.url)),
        },
    },
    test: {
        server: {
            deps: {
                /*
                 * Workspace packages are linked, so vitest inlines them by default: vite transforms
                 * every one of their ~2400 modules and - because each test file starts from a clean
                 * module registry - re-evaluates them once per test file. Externalizing a package
                 * hands it to node instead, which imports it once and caches it for the whole run.
                 *
                 * Only dependency-closed sets can be externalized: node resolves an externalized
                 * package's own imports natively too, so anything it pulls in must be externalized
                 * as well - otherwise a package ends up loaded twice (once natively, once inlined)
                 * with two copies of its React contexts and module-level state.
                 *
                 * What must stay inlined, and why:
                 * - sdk-ui-charts, sdk-ui-pivot: the suite `vi.mock`s their `internal-tests/Core*`
                 *   entry points, which only works for modules vitest itself processes,
                 * - sdk-ui-ext: it imports both of the above, so externalizing it would resolve them
                 *   natively and bypass those mocks,
                 * - sdk-ui-geo: it needs the `maplibre-gl` alias above, and aliases do not apply to
                 *   natively imported modules.
                 */
                external: [
                    // The recorded executions are plain JSON modules; letting node import them
                    // directly is much cheaper than having vite transform ~1100 of them into ESM
                    // wrappers.
                    /reference-workspace\/esm\//,
                    // The model/backend layer: depends only on itself and on real node_modules.
                    /\/sdk\/libs\/(util|sdk-model|sdk-backend-spi|sdk-backend-base|sdk-backend-mockingbird)\/esm\//,
                    // The shared UI layer: ~1130 modules, sdk-ui-kit alone accounts for ~640 and
                    // sdk-ui-filters for ~260 of them. sdk-ui-filters is only reached through a
                    // handful of leaf modules of the sdk-ui-ext barrel that no scenario renders, but
                    // it is a normal dependency-closed member of this layer (it imports nothing
                    // outside sdk-model/sdk-ui/sdk-ui-kit/sdk-backend-spi/util), so node can own it.
                    // Nothing in the suite mocks or aliases anything in here.
                    /\/sdk\/libs\/(sdk-ui|sdk-ui-kit|sdk-ui-filters|sdk-ui-theme-provider|sdk-ui-vis-commons)\/esm\//,
                ],
            },
        },
        environment: "happy-dom",
        reporters: ["default"],
        setupFiles: "./vitest.setup.ts",
        fileParallelism: false,
        pool: "threads",
        maxWorkers: 8, // Thread count for CI
        isolate: false,
        maxConcurrency: 8, // Concurrency for CI
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
