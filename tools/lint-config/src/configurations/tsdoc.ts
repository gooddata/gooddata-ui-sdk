// (C) 2026 GoodData Corporation

import { IPackage, OverrideFiles, Rules } from "../types.js";

export const tsdocPlugin: IPackage = {
    name: "eslint-plugin-tsdoc",
    version: "0.5.4",
};

export const tsdocRules: Rules<"jsdoc" | "tsdoc"> = {
    "tsdoc/syntax": "error",

    // Completeness: if a docblock documents any param, it must document all of them
    // Nested (dotted) param names are invalid TSDoc, so destructured props are not required
    "jsdoc/require-param": ["error", { checkDestructured: false, ignoreWhenAllParamsMissing: true }],

    // TSDoc style usually doesn't put JSDoc `{type}` after @param
    "jsdoc/require-param-type": "off",
};

export const tsdocOverrideFiles: OverrideFiles = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];
