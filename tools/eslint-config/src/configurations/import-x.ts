// (C) 2025-2026 GoodData Corporation

import { type IPackage, importXOverrides, importXRules, scopeRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const importXPlugin: IPackage = {
    name: "eslint-plugin-import-x",
    version: "4.17.1",
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
    overrides: [
        ...importXOverrides.map((override) => ({
            ...override,
            rules: scopeRules(override.rules, "import-x"),
        })),
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
        },
    ],
};

const flat = {
    ...commonConfiguration,
    rules: scopeRules(importXRules, "import-x"),
    plugins: { "import-x": importXPlugin },
};

export const importX: IConfiguration<"import-x"> = {
    legacy: {
        ...commonConfiguration,
        rules: scopeRules(importXRules, "import-x"),
        plugins: ["import-x"],
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
