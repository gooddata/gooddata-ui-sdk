// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const security: IConfiguration = {
    rules: {
        "no-caller": 2,
        "no-eval": 2,
        "no-delete-var": 2,
        "no-octal-escape": 2,
    },
};
