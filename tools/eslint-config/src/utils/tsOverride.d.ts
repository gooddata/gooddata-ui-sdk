// (C) 2025-2026 GoodData Corporation

export interface IFlatConfig {
    files?: string[];
    ignores?: string[];
    languageOptions?: Record<string, unknown>;
    linterOptions?: Record<string, unknown>;
    processor?: unknown;
    plugins?: Record<string, unknown>;
    rules?: Record<string, unknown>;
    settings?: Record<string, unknown>;
}

/**
 * Creates a TypeScript override config for v9 flat config.
 * Use `import.meta.dirname` for the dirname parameter (requires Node 20.11+).
 *
 * @example
 * ```ts
 * import gooddata from "@gooddata/eslint-config/esm-react-vitest";
 * import { tsOverride } from "@gooddata/eslint-config/tsOverride";
 *
 * export default [
 *     ...gooddata,
 *     tsOverride(import.meta.dirname, {
 *         "@typescript-eslint/no-explicit-any": "warn",
 *     }),
 * ];
 * ```
 *
 * @param dirname - The directory containing tsconfig.json (use import.meta.dirname)
 * @param rules - Additional rules to apply
 * @returns Flat config object for TypeScript files
 */
export function tsOverride(dirname: string, rules?: Record<string, unknown>): IFlatConfig;
