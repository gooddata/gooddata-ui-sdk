// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const headersPlugin: IPackage = {
    name: "eslint-plugin-headers",
    version: "1.3.3",
};

const v9 = {
    packages: [headersPlugin],
    plugins: { headers: headersPlugin },
    rules: {
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
    },
};

export const header: IDualConfiguration<"header", "headers"> = {
    v8: {
        packages: [
            {
                name: "eslint-plugin-header",
                version: "3.1.1",
            },
        ],
        plugins: ["header"],
        rules: {
            "header/header": [
                2,
                "line",
                {
                    pattern: "^ \\(C\\) \\d{4}(-\\d{4})? GoodData Corporation$",
                    template: ` (C) ${new Date().getFullYear()} GoodData Corporation`,
                },
            ],
        },
    },
    v9,
    ox: v9,
};
