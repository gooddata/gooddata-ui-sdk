// (C) 2025 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

export const env: IDualConfiguration = {
    v8: {
        env: {
            node: true,
            es2022: true,
        },
    },
    v9: {
        packages: [{ name: "globals", version: "17.2.0" }],
        languageOptions: {
            globalsPresets: ["node", "es2022"],
        },
    },
};
