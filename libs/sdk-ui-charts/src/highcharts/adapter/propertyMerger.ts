// (C) 2024-2025 GoodData Corporation

import { merge } from "lodash-es";

import { type HighchartsOptions } from "../lib/index.js";

export const mergePropertiesWithOverride = (
    base: HighchartsOptions,
    override: Partial<HighchartsOptions> | undefined,
): HighchartsOptions => {
    if (override === undefined) {
        return base;
    }
    return merge(base, override);
};
