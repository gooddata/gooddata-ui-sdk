// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

// const regexpPlugin: IPackage = {
//     name: "eslint-plugin-regexp",
//     version: "2.7.0",
// };

// const rules = {
//     // these rules can make some regexes much less readable
//     "regexp/prefer-d": "off",
//     "regexp/prefer-w": "off",
// };

const common = {
    // TODO: eslint-plugin-regexp rules crash on TS files due to missing type services
    // Re-enable when the plugin handles this gracefully or we add parser support
    // packages: [regexpPlugin],
};

export const regexp: IConfiguration<"regexp"> = {
    legacy: {
        // TODO: Fix this
        // packages: [regexpPlugin],
        // extends: ["plugin:regexp/recommended"],
        // rules,
    },
    flat: { v9: common, v9ox: common, v10: common, v10ox: common },
};
