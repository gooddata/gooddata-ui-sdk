// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const importPlugin: IPackage = {
    name: "eslint-plugin-import",
    version: "2.32.0",
};

const importResolverTypescript: IPackage = {
    name: "eslint-import-resolver-typescript",
    version: "4.4.4",
};

const packages = [importPlugin, importResolverTypescript];

const commonRules = {
    "import/order": [
        "error",
        {
            pathGroups: [
                {
                    pattern: "react",
                    group: "external",
                    position: "before",
                },
                {
                    pattern: "@gooddata/**",
                    group: "external",
                    position: "after",
                },
            ],
            groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
            pathGroupsExcludedImportTypes: ["react"],
            alphabetize: {
                order: "asc",
                caseInsensitive: true,
            },
            "newlines-between": "always",
        },
    ],
    "import/no-unassigned-import": "error",
};

export const import_: IDualConfiguration<"import"> = {
    v8: {
        packages,
        plugins: ["import"],
        extends: ["plugin:import/errors"],
        rules: commonRules,
        overrides: [
            {
                parser: "@typescript-eslint/parser",
                files: ["**/*.ts", "**/*.tsx"],
                extends: ["plugin:import/typescript"],
            },
        ],
    },
    v9: {
        packages,
        plugins: { import: importPlugin },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                },
                node: {
                    extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
                },
            },
        },
        rules: {
            "import/no-unresolved": "error",
            "import/named": "error",
            "import/namespace": "error",
            "import/default": "error",
            "import/export": "error",
            "import/no-named-as-default": "warn",
            "import/no-named-as-default-member": "warn",
            "import/no-duplicates": "warn",
            ...commonRules,
        },
        overrides: [
            {
                files: ["**/*.ts", "**/*.tsx"],
                settings: {
                    "import/extensions": [".ts", ".cts", ".mts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
                    "import/external-module-folders": ["node_modules", "node_modules/@types"],
                    "import/parsers": {
                        "@typescript-eslint/parser": [".ts", ".cts", ".mts", ".tsx"],
                    },
                    "import/resolver": {
                        node: {
                            extensions: [".ts", ".cts", ".mts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
                        },
                    },
                },
                rules: {
                    // TypeScript compilation already ensures that named imports exist
                    "import/named": "off",
                },
            },
        ],
    },
};
