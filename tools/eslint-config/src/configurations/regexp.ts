// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const regexpPlugin: IPackage = {
    name: "eslint-plugin-regexp",
    version: "2.7.0",
};

const rules = {
    // these rules can make some regexes much less readable
    "regexp/prefer-d": "off",
    "regexp/prefer-w": "off",
};

export const regexp: IDualConfiguration<"regexp"> = {
    v8: {
        packages: [regexpPlugin],
        extends: ["plugin:regexp/recommended"],
        rules,
    },
    v9: {
        // TODO: eslint-plugin-regexp rules crash on TS files due to missing type services
        // Re-enable when the plugin handles this gracefully or we add parser support
        // packages: [regexpPlugin],
    },
};
