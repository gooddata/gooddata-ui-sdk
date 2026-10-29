// (C) 2026 GoodData Corporation

import { type RolldownOptions } from "rolldown";

/**
 * Turns the plugin timing check off. Its fixed per-build plugin overhead is a large share of a small
 * bundle's total, so the check trips intermittently on loaded CI runners without pointing at a real
 * problem.
 */
export const CHECKS_NO_PLUGIN_TIMINGS: NonNullable<RolldownOptions["checks"]> = {
    pluginTimings: false,
};
