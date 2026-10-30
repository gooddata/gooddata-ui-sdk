// (C) 2026 GoodData Corporation

import { type ConfigEnv, type UserConfig, type UserConfigFn, defineConfig, mergeConfig } from "vite";

import { type Preset, type RequireAllOptional, createPreset } from "../../shared/createPreset.js";

/**
 * Raw Vite config a consumer merges over a preset: a plain config or a function of the environment.
 */
export type ViteOverrides = UserConfig | UserConfigFn;

/**
 * A Vite config as a function of the environment, which is what every preset returns.
 *
 * Declared here rather than reused from vite on purpose: a consumer whose type-check emits
 * declarations has to name the type of its `export default`, and vite's own `UserConfigFnPromise`
 * resolves through this package's copy of vite, a pnpm store path TypeScript refuses to reference
 * (TS2883). A type this package declares is named through `@gooddata/toolchain-config/vite` instead.
 */
export type ViteConfigFn = (env: ConfigEnv) => Promise<UserConfig>;

/**
 * A Vite preset: typed options plus raw Vite overrides deep-merged on top. The result is a function
 * of the environment, since the presets read `mode` and `command`.
 */
export type VitePreset<TOptions extends object> = Preset<ViteConfigFn, TOptions, ViteOverrides>;

function finalize(base: ViteConfigFn, overrides: ViteOverrides | undefined): ViteConfigFn {
    return defineConfig(async (env: ConfigEnv) => {
        const resolvedBase = await base(env);

        if (!overrides) {
            return resolvedBase;
        }

        const resolvedOverrides = typeof overrides === "function" ? await overrides(env) : overrides;

        // Vite's own merge: objects recurse, arrays such as plugins and aliases concatenate.
        return mergeConfig(resolvedBase, resolvedOverrides) as UserConfig;
    });
}

/**
 * Wraps a preset's composition in the ritual every Vite preset shares: defaulting the options,
 * merging the consumer's overrides, and passing the result through Vite's `defineConfig`.
 */
export function createVitePreset<TOptions extends object>(
    compose: (options: TOptions) => ViteConfigFn,
    ..._allOptional: RequireAllOptional<TOptions>
): VitePreset<TOptions> {
    return createPreset(finalize, compose, ..._allOptional);
}
