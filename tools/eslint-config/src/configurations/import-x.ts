// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const importXPlugin: IPackage = {
    name: "eslint-plugin-import-x",
    version: "4.16.1",
};

const commonConfiguration = {
    packages: [
        importXPlugin,
        {
            name: "eslint-import-resolver-typescript",
            version: "4.4.4",
        },
    ],
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
};

const v9 = {
    ...commonConfiguration,
    plugins: { "import-x": importXPlugin },
};

export const importX: IDualConfiguration<"import-x"> = {
    v8: {
        ...commonConfiguration,
        plugins: ["import-x"],
    },
    v9,
    ox: v9,
};
