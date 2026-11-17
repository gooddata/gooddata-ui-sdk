// (C) 2026 GoodData Corporation

import { jsDocOverrideFiles, jsdocRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const jsdoc: IConfiguration<"jsdoc"> = {
    plugins: ["jsdoc"],
    overrides: [
        {
            files: jsDocOverrideFiles,
            rules: jsdocRules,
        },
    ],
};
