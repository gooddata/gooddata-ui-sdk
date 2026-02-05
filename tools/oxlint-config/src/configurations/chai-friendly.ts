// (C) 2025-2026 GoodData Corporation

import type { IConfiguration, IPackage } from "../types.js";

const chaiFriendlyPlugin: IPackage = {
    name: "eslint-plugin-chai-friendly",
    version: "1.1.0",
};

// empty generic because we have built-in eslint and typescript-eslint rules here too
export const chaiFriendly: IConfiguration = {
    packages: [chaiFriendlyPlugin],
    jsPlugins: [{ name: "chai-friendly", specifier: chaiFriendlyPlugin.name }],
    rules: {
        "no-unused-expressions": "off",
        "chai-friendly/no-unused-expressions": "error",
    },
    // overrides: [
    //     {
    //         files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    //         rules: {
    //             "@typescript-eslint/no-unused-expressions": "off",
    //         },
    //     },
    // ],
};
