// (C) 2025-2026 GoodData Corporation

import {
    type IPackage,
    typescriptConflicts,
    typescriptOverrideFiles,
    typescriptRules,
    typescriptRulesNativeNotSupported,
} from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const tsParser = "@typescript-eslint/parser";

const typescriptEslintPlugin: IPackage = {
    name: "@typescript-eslint/eslint-plugin",
    version: "8.58.0",
};

const packages = [
    {
        name: tsParser,
        version: "8.58.0",
    },
    typescriptEslintPlugin,
];

const common = {
    packages,
    plugins: { "@typescript-eslint": typescriptEslintPlugin },
    parser: tsParser,
    languageOptions: {
        sourceType: "module" as const,
    },
};

const commonParserOptions = {
    projectService: true,
};

const overrideLanguageOptions = {
    parserOptions: commonParserOptions,
};

const flat = {
    ...common,
    overrides: [
        {
            files: typescriptOverrideFiles,
            rules: {
                ...typescriptConflicts,
                ...typescriptRules,
            },
            languageOptions: overrideLanguageOptions,
        },
    ],
};

const ox = {
    ...common,
    overrides: [
        {
            files: typescriptOverrideFiles,
            rules: {
                ...typescriptConflicts,
                ...typescriptRulesNativeNotSupported,
            },
            languageOptions: overrideLanguageOptions,
        },
    ],
};

export const typescript: IConfiguration<"@typescript-eslint" | "no-restricted-syntax", ""> = {
    legacy: {
        packages,
        plugins: ["@typescript-eslint"],
        overrides: [
            {
                files: typescriptOverrideFiles,
                rules: {
                    ...typescriptConflicts,
                    ...typescriptRules,
                },
                parser: tsParser,
                parserOptions: {
                    ...commonParserOptions,
                    ecmaVersion: 2022,
                    sourceType: "module",
                },
            },
        ],
    },
    flat: { v9: flat, v9ox: ox, v10: flat, v10ox: ox },
};
