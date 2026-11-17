// (C) 2025-2026 GoodData Corporation

import { type IPackage, jsDocOverrideFiles, jsdocRules } from "@gooddata/lint-config";

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

const common = {
    packages: [jsdocPlugin],
    overrides: [
        {
            files: jsDocOverrideFiles,
            plugins: { jsdoc: jsdocPlugin },
            settings,
            rules: jsdocRules,
        },
    ],
};

export const jsdoc: IConfiguration<"jsdoc"> = {
    legacy: {
        packages: [jsdocPlugin],
        overrides: [
            {
                files: jsDocOverrideFiles,
                plugins: ["jsdoc"],
                settings,
                rules: jsdocRules,
            },
        ],
    },
    flat: { v9: common, v9ox: {}, v10: common, v10ox: {} },
};
