// (C) 2026 GoodData Corporation

import { type UserConfig } from "vite";

/**
 * Rolldown checks that are turned off for every vite build.
 *
 * `pluginTimings`: its fixed per-build plugin overhead is a large share of a small bundle's total, so the
 * check trips intermittently on loaded CI runners without pointing at a real problem.
 *
 * `moduleLevelDirective` (added in rolldown 1.2.9): warns that a top-level directive other than
 * `"use strict"` in a bundled dependency is dropped from the output. The ones our dependencies carry
 * are build-time hints for other tools (`"use client"` for React Server Components frameworks,
 * `'no babel-plugin-flow-react-proptypes'` for a babel plugin), none of which take part in our
 * client-only bundles, so dropping them changes nothing at runtime.
 */
export const ROLLDOWN_CHECKS = {
    pluginTimings: false,
    moduleLevelDirective: false,
};

/**
 * Vite bundles every `?worker` / `?worker&url` import in a NESTED rolldown build, which it builds from
 * `worker.rolldownOptions` alone — `build.rolldownOptions` is not inherited (see `bundleWorkerEntry`
 * in vite/dist/node/chunks/node.js). So the same checks have to be disabled here too, or the short Monaco
 * editor-worker build pulled in via gdc-metric-component / gdc-ldm-modeler intermittently trips
 * PLUGIN_TIMINGS.
 */
export const WORKER_ROLLDOWN_CHECKS: NonNullable<UserConfig["worker"]> = {
    rolldownOptions: {
        checks: ROLLDOWN_CHECKS,
    },
};
