// (C) 2026 GoodData Corporation

import { type PlaywrightTestConfig, defineConfig } from "@playwright/test";

import { type Preset, type RequireAllOptional, createPreset } from "../../shared/createPreset.js";

/**
 * A Playwright preset: typed options plus raw Playwright config merged on top.
 */
export type PlaywrightPreset<TOptions extends object> = Preset<PlaywrightTestConfig, TOptions>;

function finalize(
    base: PlaywrightTestConfig,
    overrides: PlaywrightTestConfig | undefined,
): PlaywrightTestConfig {
    // Playwright's own defineConfig merges: top level shallow, `expect`/`use`/`build` one level deep,
    // `webServer` concatenated, `projects` matched by name with a one-level `use` merge.
    return overrides ? defineConfig(base, overrides) : defineConfig(base);
}

/**
 * Wraps a preset's composition in the ritual every Playwright preset shares: defaulting the options,
 * merging the consumer's overrides, and passing the result through Playwright's `defineConfig`.
 */
export function createPlaywrightPreset<TOptions extends object>(
    compose: (options: TOptions) => PlaywrightTestConfig,
    ..._allOptional: RequireAllOptional<TOptions>
): PlaywrightPreset<TOptions> {
    return createPreset(finalize, compose, ..._allOptional);
}
