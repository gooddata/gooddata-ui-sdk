// (C) 2026 GoodData Corporation

import {
    type IPackage,
    eslintOverridesNativeNotSupported,
    eslintOverridesNativeSupported,
    eslintRulesNativeNotSupported,
    eslintRulesNativeSupported,
    scopeRules,
} from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

const eslintPlugin: IPackage = {
    name: "oxlint-plugin-eslint",
    version: "1.82.0",
};

export const eslint: IConfiguration = {
    // native plugin
    plugins: ["eslint"],

    // js plugin
    packages: [eslintPlugin],
    jsPlugins: [{ name: "eslint-js", specifier: "oxlint-plugin-eslint" }],

    rules: {
        ...eslintRulesNativeSupported,
        ...scopeRules(eslintRulesNativeNotSupported, "eslint-js"),
    },
    overrides: [
        ...eslintOverridesNativeSupported,
        ...eslintOverridesNativeNotSupported.map((override) => ({
            ...override,
            rules: scopeRules(override.rules, "eslint-js"),
        })),
    ],
};
