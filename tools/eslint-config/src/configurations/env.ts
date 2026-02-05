// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [{ name: "globals", version: "17.2.0" }],
    languageOptions: {
        globalsPresets: ["node" as const, "es2022" as const],
    },
};

export const env: IDualConfiguration = {
    v8: {
        env: {
            node: true,
            es2022: true,
        },
    },
    v9,
    ox: v9,
};
