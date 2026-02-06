// (C) 2025-2026 GoodData Corporation

import { cypressPlugin, cypressRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [cypressPlugin],
    plugins: { cypress: cypressPlugin },
    languageOptions: {
        globalsPresets: ["mocha" as const],
        globals: {
            cy: "readonly" as const,
            Cypress: "readonly" as const,
            expect: "readonly" as const,
            assert: "readonly" as const,
            chai: "readonly" as const,
        },
    },
    rules: cypressRules,
};

export const cypress: IDualConfiguration<"cypress"> = {
    v8: {
        packages: [cypressPlugin],
        plugins: ["cypress"],
        rules: cypressRules,
    },
    v9,
    ox: {},
};
