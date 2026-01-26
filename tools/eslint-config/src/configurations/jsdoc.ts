// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const jsdoc: IConfiguration<"jsdoc"> = {
    packages: [
        {
            name: "eslint-plugin-jsdoc",
            version: "62.1.0",
        },
    ],
    overrides: [
        {
            files: ["**/*.{js,cjs,mjs,jsx}"],
            plugins: ["jsdoc"],
            settings: {
                jsdoc: {
                    mode: "jsdoc",
                },
            },
            rules: {
                "jsdoc/require-param": "error", // require @param for all params
            },
        },
    ],
};
