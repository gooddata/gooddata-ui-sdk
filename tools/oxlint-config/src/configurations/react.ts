// (C) 2026 GoodData Corporation

import { reactRulesNativeSupported } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const react: IConfiguration<"react"> = {
    plugins: ["react"],
    rules: reactRulesNativeSupported,
};
