// (C) 2025-2026 GoodData Corporation

import {
    type IPackage,
    importXRules,
    importXRulesNativeNotSupported,
    scopeRules,
} from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

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
        },
    ],
};

const v9Common = {
    ...commonConfiguration,
    plugins: { "import-x": importXPlugin },
};

export const importX: IDualConfiguration<"import-x"> = {
    v8: {
        ...commonConfiguration,
        rules: scopeRules(importXRules, "import-x"),
        plugins: ["import-x"],
    },
    v9: {
        ...v9Common,
        rules: scopeRules(importXRules, "import-x"),
        plugins: { "import-x": importXPlugin },
    },
    ox: {
        ...v9Common,
        rules: scopeRules(importXRulesNativeNotSupported, "import-x"),
        plugins: { "import-x": importXPlugin },
    },
};
