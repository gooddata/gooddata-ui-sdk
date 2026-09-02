// (C) 2026 GoodData Corporation

import type { IPackage, Rules } from "../types.js";

export const headersPlugin: IPackage = {
    name: "eslint-plugin-headers",
    version: "1.3.3",
};

export const headersRules: Rules<"headers"> = {
    "headers/header-format": [
        "error",
        {
            source: "string",
            style: "line",

            // NOTE:
            // eslint-plugin-headers uses parentheses for pattern placeholders: (key)
            // and braces for variable substitutions: {key}
            content: "(C) (years) GoodData Corporation",

            // Accept "2026" or "2020-2026", and when fixing insert the current year.
            patterns: {
                years: {
                    pattern: "\\d{4}(-\\d{4})?",
                    defaultValue: `${new Date().getFullYear()}`,
                },
            },
        },
    ],
};
