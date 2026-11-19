// (C) 2026 GoodData Corporation

import { tsdocOverrideFiles, tsdocPlugin, tsdocRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const tsdoc: IConfiguration<"tsdoc"> = {
    packages: [tsdocPlugin],
    jsPlugins: [{ name: "tsdoc", specifier: tsdocPlugin.name }],
    overrides: [
        {
            files: tsdocOverrideFiles,
            rules: tsdocRules,
        },
    ],
};
