// (C) 2019-2026 GoodData Corporation

import stringify from "json-stable-stringify";

import { _merge } from "@gooddata/util";

import { type IDimension } from "./dimension.js";

type DimensionPropsToDefault = Pick<IDimension, "totals">;

/**
 * Calculates dimension fingerprint; ensures that the optional vs default values are correctly reflected in
 * the fingerprint.
 *
 * @internal
 */
export function dimensionFingerprint(dim: IDimension): string {
    const dimDefaults: DimensionPropsToDefault = {
        totals: [],
    };

    const withDefaultTotals: IDimension = _merge(dimDefaults, dim);

    return stringify(withDefaultTotals) || "undefined";
}
