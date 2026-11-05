// (C) 2025-2026 GoodData Corporation

import { type IPackage } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const jsdocPlugin: IPackage = {
    name: "eslint-plugin-jsdoc",
    version: "65.4.2",
};

const settings = {
    jsdoc: {
        mode: "jsdoc",
    },
};

const rules = {
    "jsdoc/require-param": "error", // require @param for all params
};

const common = {
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

export const jsdoc: IConfiguration<"jsdoc"> = {
    legacy: {
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
    flat: { v9: common, v9ox: common, v10: common, v10ox: common },
};
