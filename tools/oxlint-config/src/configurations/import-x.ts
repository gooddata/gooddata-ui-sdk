// (C) 2026 GoodData Corporation

import { importXRulesNativeSupported } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const importX: IConfiguration = {
    plugins: ["import"],
    rules: importXRulesNativeSupported,
};
