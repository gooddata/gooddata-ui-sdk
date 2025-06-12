// (C) 2024 GoodData Corporation

import merge from "lodash/merge.js";

import { HighchartsOptions } from "../lib/index.js";

export const mergePropertiesWithOverride = (
    base: HighchartsOptions,
    override: Partial<HighchartsOptions>,
): HighchartsOptions => {
    if (override === undefined) {
        return base;
    }
    return merge(base, override);
};
