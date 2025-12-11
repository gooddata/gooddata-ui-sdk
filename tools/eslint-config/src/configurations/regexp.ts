// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const regexp: IConfiguration<"regexp"> = {
    packages: [
        {
            name: "eslint-plugin-regexp",
            version: "1.15.0",
        },
    ],
    extends: ["plugin:regexp/recommended"],
    rules: {
        // these rules can make some regexes much less readable
        "regexp/prefer-d": "off",
        "regexp/prefer-w": "off",
    },
};
