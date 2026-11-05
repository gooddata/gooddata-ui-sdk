// (C) 2025-2026 GoodData Corporation

import { headersPlugin, headersRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const flat = {
    packages: [headersPlugin],
    plugins: { headers: headersPlugin },
    rules: headersRules,
};

export const header: IConfiguration<"header", "headers"> = {
    legacy: {
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
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
