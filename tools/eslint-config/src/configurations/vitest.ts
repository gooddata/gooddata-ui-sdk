// (C) 2025-2026 GoodData Corporation

import { type IPackage, scopeRules, vitestRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const vitestPlugin: IPackage = {
    name: "@vitest/eslint-plugin",
    version: "1.6.19",
};

const packages = [vitestPlugin];

const flat = {
    packages,
    plugins: { vitest: vitestPlugin },
    rules: scopeRules(vitestRules, "vitest"),
};

export const vitest: IConfiguration<"@vitest", "vitest"> = {
    legacy: {
        packages,
        plugins: ["@vitest"],
        rules: scopeRules(vitestRules, "@vitest"),
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
