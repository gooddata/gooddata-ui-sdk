// (C) 2025-2026 GoodData Corporation

import { headersPlugin, headersRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [headersPlugin],
    plugins: { headers: headersPlugin },
    rules: headersRules,
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
    ox: {},
};
