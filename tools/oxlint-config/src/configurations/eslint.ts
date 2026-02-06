// (C) 2026 GoodData Corporation

import { eslintOverrides, eslintRulesNativeSupported } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const eslint: IConfiguration = {
    plugins: ["eslint"],
    rules: eslintRulesNativeSupported,
    overrides: eslintOverrides,
};
