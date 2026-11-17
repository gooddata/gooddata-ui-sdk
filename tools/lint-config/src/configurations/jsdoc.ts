// (C) 2026 GoodData Corporation

import { OverrideFiles, Rules } from "../types.js";

export const jsdocRules: Rules<"jsdoc"> = {
    // require @param for all params; nested (dotted) names are invalid TSDoc, so skip destructured props
    "jsdoc/require-param": ["error", { checkDestructured: false }],
};

export const jsDocOverrideFiles: OverrideFiles = ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"];
