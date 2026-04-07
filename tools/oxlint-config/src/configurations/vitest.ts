// (C) 2026 GoodData Corporation

import {
    scopeRules,
    vitestPlugin,
    vitestRulesNativeNotSupported,
    vitestRulesNativeSupported,
} from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const vitest: IConfiguration<"vitest"> = {
    packages: [vitestPlugin],
    jsPlugins: [{ name: "vitest-js", specifier: vitestPlugin.name }],
    plugins: ["vitest"],
    rules: {
        ...scopeRules(vitestRulesNativeSupported, "vitest"),
        ...scopeRules(vitestRulesNativeNotSupported, "vitest-js"),
    },
};
