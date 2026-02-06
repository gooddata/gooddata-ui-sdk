// (C) 2025-2026 GoodData Corporation

import { eslintOverrides, eslintRules, eslintRulesNativeNotSupported } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9Common = {
    packages: [
        {
            name: "@eslint/js",
            version: "9.28.0",
        },
    ],
    overrides: eslintOverrides,
};

export const eslint: IDualConfiguration = {
    v8: {
        rules: eslintRules,
        overrides: eslintOverrides,
    },
    v9: { ...v9Common, rules: eslintRules },
    ox: { ...v9Common, rules: eslintRulesNativeNotSupported },
};
