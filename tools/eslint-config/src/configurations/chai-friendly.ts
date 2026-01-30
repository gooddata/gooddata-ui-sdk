// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const chaiFriendlyPlugin: IPackage = {
    name: "eslint-plugin-chai-friendly",
    version: "1.1.0",
};

// empty generic because we have built-in eslint and typescript-eslint rules here too
const commonConfiguration = {
    packages: [chaiFriendlyPlugin],
    rules: {
        "no-unused-expressions": "off",
        "chai-friendly/no-unused-expressions": "error",
    },
    overrides: [
        {
            parser: "@typescript-eslint/parser",
            files: ["**/*.ts", "**/*.tsx"],
            rules: {
                "@typescript-eslint/no-unused-expressions": "off",
            },
        },
    ],
};

export const chaiFriendly: IDualConfiguration = {
    v8: { ...commonConfiguration, plugins: ["chai-friendly"] },
    v9: { ...commonConfiguration, plugins: { "chai-friendly": chaiFriendlyPlugin } },
};
