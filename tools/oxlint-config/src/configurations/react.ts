// (C) 2026 GoodData Corporation

import { reactHooksRules, reactRulesNativeSupported } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const react: IConfiguration<"react" | "react-hooks"> = {
    plugins: ["react"],
    rules: { ...reactRulesNativeSupported, ...reactHooksRules },
};
