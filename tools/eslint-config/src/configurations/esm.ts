// (C) 2025 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

export const esm: IDualConfiguration = {
    v8: {
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
    },
    v9: {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
    },
};
