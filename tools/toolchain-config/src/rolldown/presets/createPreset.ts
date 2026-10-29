// (C) 2026 GoodData Corporation

import { type RolldownOptions, defineConfig } from "rolldown";

import { type Preset, type RequireAllOptional, createPreset } from "../../shared/createPreset.js";
import { mergeOptions } from "../../shared/merge.js";

/**
 * A rolldown preset: typed options plus raw rolldown overrides deep-merged on top.
 */
export type RolldownPreset<TOptions extends object> = Preset<RolldownOptions, TOptions>;

function finalize(base: RolldownOptions, overrides: RolldownOptions | undefined): RolldownOptions {
    // rolldown ships no merge helper of its own, so the overrides go through ours.
    return defineConfig(mergeOptions(base, overrides));
}

/**
 * Wraps a preset's composition in the ritual every rolldown preset shares: defaulting the options,
 * merging the consumer's overrides, and passing the result through rolldown's `defineConfig`.
 */
export function createRolldownPreset<TOptions extends object>(
    compose: (options: TOptions) => RolldownOptions,
    ..._allOptional: RequireAllOptional<TOptions>
): RolldownPreset<TOptions> {
    return createPreset(finalize, compose, ..._allOptional);
}
