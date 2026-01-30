// (C) 2025 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const commonConfiguration = {
    rules: {
        "no-caller": 2,
        "no-eval": 2,
        "no-delete-var": 2,
        "no-octal-escape": 2,
    },
};

export const security: IDualConfiguration = {
    v8: commonConfiguration,
    v9: commonConfiguration,
};
