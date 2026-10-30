// (C) 2026 GoodData Corporation

import { type UserConfig } from "vite";

/**
 * Turns the plugin timing check off. Its fixed per-build plugin overhead is a large share of a small
 * bundle's total, so the check trips intermittently on loaded CI runners without pointing at a real
 * problem.
 */
export const NO_PLUGIN_TIMINGS = {
    pluginTimings: false,
};

/**
 * Vite bundles every `?worker` / `?worker&url` import in a NESTED rolldown build, which it builds from
 * `worker.rolldownOptions` alone — `build.rolldownOptions` is not inherited (see `bundleWorkerEntry`
 * in vite/dist/node/chunks/node.js). So the same check has to be disabled here, or the short Monaco
 * editor-worker build pulled in via gdc-metric-component / gdc-ldm-modeler intermittently trips
 * PLUGIN_TIMINGS.
 */
export const WORKER_NO_PLUGIN_TIMINGS: NonNullable<UserConfig["worker"]> = {
    rolldownOptions: {
        checks: NO_PLUGIN_TIMINGS,
    },
};
