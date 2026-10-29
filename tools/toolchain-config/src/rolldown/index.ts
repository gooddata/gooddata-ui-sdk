// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

import { type IE2EOptions, e2e } from "./presets/e2e.js";

export { CHECKS_NO_PLUGIN_TIMINGS } from "./parts/checks.js";
export {
    type ExternalPattern,
    NODE_BUILTINS,
    PLAYWRIGHT_EXTERNALS,
    playwrightExternals,
} from "./parts/externals.js";
export {
    DEFAULT_PLAYWRIGHT_CONFIG_FILE,
    DEFAULT_PLAYWRIGHT_SPEC_GLOB,
    type IPlaywrightInputsOptions,
    playwrightInputs,
} from "./parts/inputs.js";
export { esmOutput } from "./parts/output.js";
export { type RolldownPreset } from "./presets/createPreset.js";
export { type IE2EOptions };

/**
 * The rolldown presets, one full config per kind of package. Each takes typed options for what it
 * supports and raw rolldown overrides for anything else.
 */
export const presets = {
    e2e,
} as const;
