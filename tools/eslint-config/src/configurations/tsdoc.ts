// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const tsdoc: IConfiguration<"tsdoc"> = {
    packages: [
        {
            name: "eslint-plugin-tsdoc",
            version: "0.2.14",
        },
    ],
    plugins: ["tsdoc"],
    rules: {
        "tsdoc/syntax": "error",
    },
};
