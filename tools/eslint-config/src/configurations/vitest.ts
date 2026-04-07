// (C) 2025-2026 GoodData Corporation

import { scopeRules, vitestPlugin, vitestRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const packages = [vitestPlugin];

const v9 = {
    packages,
    plugins: { vitest: vitestPlugin },
    rules: scopeRules(vitestRules, "vitest"),
};

export const vitest: IDualConfiguration<"@vitest", "vitest"> = {
    v8: {
        packages,
        plugins: ["@vitest"],
        rules: scopeRules(vitestRules, "@vitest"),
    },
    v9,
    ox: {},
};
