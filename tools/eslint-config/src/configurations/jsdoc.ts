// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const jsdocPlugin: IPackage = {
    name: "eslint-plugin-jsdoc",
    version: "62.1.0",
};

const settings = {
    jsdoc: {
        mode: "jsdoc",
    },
};

const rules = {
    "jsdoc/require-param": "error", // require @param for all params
};

const v9 = {
    packages: [jsdocPlugin],
    overrides: [
        {
            files: ["**/*.{js,cjs,mjs,jsx}"],
            plugins: { jsdoc: jsdocPlugin },
            settings,
            rules,
        },
    ],
};

export const jsdoc: IDualConfiguration<"jsdoc"> = {
    v8: {
        packages: [jsdocPlugin],
        overrides: [
            {
                files: ["**/*.{js,cjs,mjs,jsx}"],
                plugins: ["jsdoc"],
                settings,
                rules,
            },
        ],
    },
    v9,
    ox: v9,
};
