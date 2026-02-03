// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const importXPlugin: IPackage = {
    name: "eslint-plugin-import-x",
    version: "4.16.1",
};

const importResolverTypescript: IPackage = {
    name: "eslint-import-resolver-typescript",
    version: "4.4.4",
};

const packages = [importXPlugin, importResolverTypescript];

const commonRules = {
    "import-x/order": [
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
    "import-x/no-unassigned-import": "error",
};

export const importX: IDualConfiguration<"import-x"> = {
    v8: {
        packages,
        plugins: ["import-x"],
        extends: ["plugin:import-x/recommended"],
        settings: {
            "import-x/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                },
                node: {
                    extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
                },
            },
        },
        rules: commonRules,
        overrides: [
            {
                parser: "@typescript-eslint/parser",
                files: ["**/*.ts", "**/*.tsx"],
                extends: ["plugin:import-x/typescript"],
            },
        ],
    },
    v9: {
        packages,
        plugins: { "import-x": importXPlugin },
        settings: {
            "import-x/extensions": [".js", ".jsx", ".mjs", ".cjs"],
        },
        rules: {
            "import-x/no-unresolved": "error",
            "import-x/named": "error",
            "import-x/namespace": "error",
            "import-x/default": "error",
            "import-x/export": "error",
            "import-x/no-named-as-default": "warn",
            "import-x/no-named-as-default-member": "warn",
            "import-x/no-duplicates": "warn",
            ...commonRules,
        },
        overrides: [
            {
                files: ["**/*.ts", "**/*.cts", "**/*.mts", "**/*.tsx"],
                settings: {
                    "import-x/extensions": [".ts", ".cts", ".mts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
                    "import-x/external-module-folders": ["node_modules", "node_modules/@types"],
                    "import-x/parsers": {
                        "@typescript-eslint/parser": [".ts", ".cts", ".mts", ".tsx"],
                    },
                    "import-x/resolver": {
                        typescript: {
                            alwaysTryTypes: true,
                        },
                    },
                },
                rules: {
                    // TypeScript compilation already ensures that named imports exist
                    "import-x/named": "off",
                },
            },
        ],
    },
};
