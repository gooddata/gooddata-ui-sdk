// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

// empty generic because we have built-in eslint and typescript-eslint rules here too
export const chaiFriendly: IConfiguration = {
    packages: [
        {
            name: "eslint-plugin-chai-friendly",
            version: "1.1.0",
        },
    ],
    plugin: "chai-friendly",
    rules: {
        "no-unused-expressions": "off",
        "chai-friendly/no-unused-expressions": "error",
    },
    override: {
        parser: "@typescript-eslint/parser",
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            "@typescript-eslint/no-unused-expressions": "off",
        },
    },
};
