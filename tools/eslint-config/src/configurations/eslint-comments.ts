// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const eslintComments: IConfiguration<"eslint-comments"> = {
    packages: [
        {
            name: "eslint-plugin-eslint-comments",
            version: "3.2.0",
        },
    ],
    plugin: "eslint-comments",
    rules: {
        // unused disable comments
        "eslint-comments/no-unused-disable": "error",
    },
};
