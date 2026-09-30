// (C) 2026 GoodData Corporation

import { importXOverrides, importXRules, scopeRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const importX: IConfiguration = {
    plugins: ["import"],
    rules: scopeRules(importXRules, "import"),
    overrides: [
        ...importXOverrides.map((override) => ({
            ...override,
            rules: scopeRules(override.rules, "import"),
        })),
    ],
};
