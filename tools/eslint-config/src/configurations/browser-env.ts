// (C) 2025 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

export const browserEnv: IDualConfiguration = {
    v8: {
        env: {
            browser: true,
        },
    },
    v9: {
        packages: [{ name: "globals", version: "17.2.0" }],
        languageOptions: {
            globalsPresets: ["browser"],
        },
    },
};
