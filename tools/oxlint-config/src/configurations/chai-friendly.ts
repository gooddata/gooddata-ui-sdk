// (C) 2025-2026 GoodData Corporation

import { chaiFriendlyPlugin, chaiFriendlyRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

// empty generic because we have built-in eslint and typescript-eslint rules here too
export const chaiFriendly: IConfiguration = {
    packages: [chaiFriendlyPlugin],
    jsPlugins: [{ name: "chai-friendly", specifier: chaiFriendlyPlugin.name }],
    rules: chaiFriendlyRules,
    // overrides: [
    //     {
    //         files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    //         rules: {
    //             "@typescript-eslint/no-unused-expressions": "off",
    //         },
    //     },
    // ],
};
