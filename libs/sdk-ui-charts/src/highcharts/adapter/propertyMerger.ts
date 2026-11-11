// (C) 2024-2026 GoodData Corporation

import { _merge } from "@gooddata/util";

import { type HighchartsOptions } from "../lib/index.js";

export const mergePropertiesWithOverride = (
    base: HighchartsOptions,
    override: Partial<HighchartsOptions> | undefined,
): HighchartsOptions => {
    if (override === undefined) {
        return base;
    }
    return _merge(base, override);
};
