// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const noOnlyTests: IConfiguration<"no-only-tests"> = {
    packages: [
        {
            name: "eslint-plugin-no-only-tests",
            version: "2.6.0",
        },
    ],
    plugins: ["no-only-tests"],
    rules: {
        "no-only-tests/no-only-tests": ["error", { block: ["fixture"], focus: ["only"] }],
    },
};
