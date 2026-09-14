// (C) 2025-2026 GoodData Corporation

import { eslintOverrides, eslintRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

export const eslint: IDualConfiguration = {
    v8: {
        rules: eslintRules,
        overrides: eslintOverrides,
    },
    v9: {
        packages: [
            {
                name: "@eslint/js",
                version: "9.28.0",
            },
        ],
        overrides: eslintOverrides,
        rules: eslintRules,
    },
    ox: {},
};
