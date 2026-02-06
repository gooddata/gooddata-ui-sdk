// (C) 2025-2026 GoodData Corporation

import { securityRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const commonConfiguration = {
    rules: securityRules,
};

export const security: IDualConfiguration = {
    v8: commonConfiguration,
    v9: commonConfiguration,
    ox: {},
};
