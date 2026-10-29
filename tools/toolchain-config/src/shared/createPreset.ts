// (C) 2026 GoodData Corporation

/**
 * A preset as consumers call it: typed options for the variation the preset supports, plus raw
 * tool config deep-merged on top for everything it does not.
 */
export type Preset<TConfig, TOptions extends object> = (options?: TOptions, overrides?: TConfig) => TConfig;

/**
 * Resolves to an empty tuple when every field of the options is optional, so the preset can be called
 * without arguments. Otherwise it demands an extra argument that cannot be supplied, which fails the
 * preset definition with the message below.
 */
export type RequireAllOptional<TOptions extends object> =
    Record<string, never> extends TOptions
        ? []
        : [error: "Preset options must all be optional so the preset can be called without arguments"];

/**
 * Builds a preset from its composition and the tool-specific finalizer that merges overrides and
 * passes the result through the tool's `defineConfig`. Each tool wraps this with its own finalizer.
 */
export function createPreset<TConfig, TOptions extends object>(
    finalize: (base: TConfig, overrides: TConfig | undefined) => TConfig,
    compose: (options: TOptions) => TConfig,
    ..._allOptional: RequireAllOptional<TOptions>
): Preset<TConfig, TOptions> {
    return function preset(options?: TOptions, overrides?: TConfig): TConfig {
        // Safe: RequireAllOptional guarantees the empty object satisfies TOptions.
        return finalize(compose(options ?? ({} as TOptions)), overrides);
    };
}
