// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

const common = {
    packages: [{ name: "globals", version: "17.2.0" }],
    languageOptions: {
        globalsPresets: ["node" as const, "es2022" as const],
    },
};

export const env: IConfiguration = {
    legacy: {
        env: {
            node: true,
            es2022: true,
        },
    },
    flat: { v9: common, v9ox: common, v10: common, v10ox: common },
};
