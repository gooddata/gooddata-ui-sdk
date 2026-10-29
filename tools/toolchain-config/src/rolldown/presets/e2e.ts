// (C) 2026 GoodData Corporation

import { CHECKS_NO_PLUGIN_TIMINGS } from "../parts/checks.js";
import { type ExternalPattern, playwrightExternals } from "../parts/externals.js";
import { type IPlaywrightInputsOptions, playwrightInputs } from "../parts/inputs.js";
import { esmOutput } from "../parts/output.js";

import { createRolldownPreset } from "./createPreset.js";

/**
 * Options for the {@link e2e} preset.
 */
export interface IE2EOptions extends IPlaywrightInputsOptions {
    /**
     * Extra entries bundled next to the specs, keyed by output name, e.g. helper scripts the e2e
     * image runs on its own.
     */
    inputs?: Record<string, string>;

    /**
     * Extra externals on top of `@playwright/test` and the Node built-ins.
     */
    external?: readonly ExternalPattern[];

    /**
     * Output directory. Defaults to `dist`.
     */
    outDir?: string;
}

/**
 * Rolldown preset for a Playwright e2e package: bundles the Playwright config and every spec file into
 * self-contained ESM files under `dist/`, so the tests run inside the e2e image without the Rush
 * workspace.
 *
 * @example
 * ```ts
 * // rolldown.config.ts
 * import { presets } from "@gooddata/toolchain-config/rolldown";
 *
 * export default presets.e2e({
 *     external: [/^@axe-core\/watcher/],
 * });
 * ```
 */
export const e2e = createRolldownPreset(
    ({ inputs = {}, external = [], outDir, ...inputOptions }: IE2EOptions) => ({
        input: {
            ...playwrightInputs(inputOptions),
            ...inputs,
        },
        output: esmOutput(outDir),
        external: playwrightExternals(external),
        platform: "node",
        treeshake: true,
        checks: CHECKS_NO_PLUGIN_TIMINGS,
    }),
);
