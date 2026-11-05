// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

const options = {
    ecmaVersion: 2022,
    sourceType: "module" as const,
};

const common = {
    languageOptions: options,
};

export const esm: IConfiguration = {
    legacy: {
        parserOptions: options,
    },
    flat: { v9: common, v9ox: common, v10: common, v10ox: common },
};
