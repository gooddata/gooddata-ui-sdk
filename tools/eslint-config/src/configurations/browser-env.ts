// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [{ name: "globals", version: "17.2.0" }],
    languageOptions: {
        globalsPresets: ["browser" as const],
    },
};

export const browserEnv: IDualConfiguration = {
    v8: {
        env: {
            browser: true,
        },
    },
    v9,
    ox: v9,
};
