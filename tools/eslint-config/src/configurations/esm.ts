// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const v9 = {
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "module" as const,
    },
};

export const esm: IDualConfiguration = {
    v8: {
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
    },
    v9,
    ox: v9,
};
