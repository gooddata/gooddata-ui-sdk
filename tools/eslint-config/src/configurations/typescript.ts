// (C) 2025-2026 GoodData Corporation

import {
    type IPackage,
    typescriptConflicts,
    typescriptOverrideFiles,
    typescriptRules,
    typescriptRulesNativeNotSupported,
} from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const typescriptEslintPlugin: IPackage = {
    name: "@typescript-eslint/eslint-plugin",
    version: "8.52.0",
};

const packages = [
    {
        name: "@typescript-eslint/parser",
        version: "8.52.0",
    },
    typescriptEslintPlugin,
];

const v9Common = {
    packages,
    plugins: { "@typescript-eslint": typescriptEslintPlugin },
    parser: "@typescript-eslint/parser",
    languageOptions: {
        sourceType: "module" as const,
    },
};

export const typescript: IDualConfiguration<"@typescript-eslint" | "no-restricted-syntax", ""> = {
    v8: {
        packages,
        overrides: [
            {
                files: typescriptOverrideFiles,
                rules: {
                    ...typescriptConflicts,
                    ...typescriptRules,
                },
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    ecmaVersion: 2022,
                    sourceType: "module",
                    projectService: true,
                },
            },
        ],
    },
    v9: {
        ...v9Common,
        overrides: [
            {
                files: typescriptOverrideFiles,
                rules: {
                    ...typescriptConflicts,
                    ...typescriptRules,
                },
                languageOptions: {
                    parserOptions: {
                        projectService: true,
                    },
                },
            },
        ],
    },
    ox: {
        ...v9Common,
        overrides: [
            {
                files: typescriptOverrideFiles,
                rules: {
                    ...typescriptConflicts,
                    ...typescriptRulesNativeNotSupported,
                },
                languageOptions: {
                    parserOptions: {
                        projectService: true,
                    },
                },
            },
        ],
    },
};
