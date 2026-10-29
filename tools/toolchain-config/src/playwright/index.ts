// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

import { type IE2EOptions, e2e } from "./presets/e2e.js";

export {
    CHROMIUM_LAUNCH_ARGS_BASE,
    DEFAULT_VIEWPORT,
    type IChromiumProjectOptions,
    chromiumProject,
} from "./parts/chromium.js";
export { goodmockRetries } from "./parts/goodmock.js";
export { defaultReporters } from "./parts/reporters.js";
export { E2E_TIMEOUTS } from "./parts/timeouts.js";
export { allowSelfSignedTls } from "./parts/tls.js";
export { type IBrowserUseOptions, browserUse } from "./parts/use.js";
export { type PlaywrightPreset } from "./presets/createPreset.js";
export { type IE2EOptions };

/**
 * The Playwright presets, one full config per kind of package. Each takes typed options for what it
 * supports and raw Playwright config overrides for anything else.
 */
export const presets = {
    e2e,
} as const;
