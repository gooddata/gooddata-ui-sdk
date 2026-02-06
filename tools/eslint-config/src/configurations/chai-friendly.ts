// (C) 2025-2026 GoodData Corporation

import { chaiFriendlyPlugin, chaiFriendlyRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

// empty generic because we have built-in eslint and typescript-eslint rules here too
const commonConfiguration = {
    packages: [chaiFriendlyPlugin],
    rules: chaiFriendlyRules,
    overrides: [
        {
            parser: "@typescript-eslint/parser",
            files: ["**/*.ts", "**/*.tsx"],
            rules: {
                "@typescript-eslint/no-unused-expressions": "off",
            },
        },
    ],
};

const v9 = { ...commonConfiguration, plugins: { "chai-friendly": chaiFriendlyPlugin } };

export const chaiFriendly: IDualConfiguration = {
    v8: { ...commonConfiguration, plugins: ["chai-friendly"] },
    v9,
    ox: v9,
};
