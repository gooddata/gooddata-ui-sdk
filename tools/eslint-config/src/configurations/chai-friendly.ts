// (C) 2025-2026 GoodData Corporation

import { chaiFriendlyPlugin, chaiFriendlyRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

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

const flat = { ...commonConfiguration, plugins: { "chai-friendly": chaiFriendlyPlugin } };

export const chaiFriendly: IConfiguration = {
    legacy: { ...commonConfiguration, plugins: ["chai-friendly"] },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
