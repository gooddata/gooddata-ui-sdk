// (C) 2026 GoodData Corporation

import { scopeRules, vitestRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const vitest: IConfiguration<"vitest"> = {
    plugins: ["vitest"],
    rules: scopeRules(vitestRules, "vitest"),
};
