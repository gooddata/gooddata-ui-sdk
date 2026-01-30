// (C) 2025-2026 GoodData Corporation

import tsParser from "@typescript-eslint/parser";

/**
 * Creates a TypeScript override config for v9 flat config.
 * Use `import.meta.dirname` for the dirname parameter (requires Node 20.11+).
 *
 * @example
 * ```js
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
 * @param {string} dirname - The directory containing tsconfig.json (use import.meta.dirname)
 * @param {Record<string, unknown>} rules - Additional rules to apply
 * @returns {object} Flat config object for TypeScript files
 */
export function tsOverride(dirname, rules = {}) {
    return {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                tsconfigRootDir: dirname,
                project: "tsconfig.json",
            },
        },
        settings: {
            "import/resolver": {
                node: {
                    extensions: [".js", ".ts"],
                },
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
            },
        },
        rules,
    };
}
