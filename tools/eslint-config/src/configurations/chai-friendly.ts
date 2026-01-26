// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

// empty generic because we have built-in eslint and typescript-eslint rules here too
export const chaiFriendly: IConfiguration = {
    packages: [
        {
            name: "eslint-plugin-chai-friendly",
            version: "1.1.0",
        },
    ],
    plugins: ["chai-friendly"],
    rules: {
        "no-unused-expressions": "off",
        "chai-friendly/no-unused-expressions": "error",
    },
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
