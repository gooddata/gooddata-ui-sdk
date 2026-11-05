// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

const common = {
    packages: [{ name: "globals", version: "17.2.0" }],
    languageOptions: {
        globalsPresets: ["browser" as const],
    },
};

export const browserEnv: IConfiguration = {
    legacy: {
        env: {
            browser: true,
        },
    },
    flat: { v9: common, v9ox: common, v10: common, v10ox: common },
};
