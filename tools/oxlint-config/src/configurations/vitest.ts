// (C) 2026 GoodData Corporation

import { scopeRules, vitestPlugin, vitestRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const vitest: IConfiguration<"vitest"> = {
    packages: [vitestPlugin],
    plugins: ["vitest"],
    rules: scopeRules(vitestRules, "vitest"),
};
