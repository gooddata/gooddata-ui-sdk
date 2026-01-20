// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const header: IConfiguration<"header"> = {
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
};
