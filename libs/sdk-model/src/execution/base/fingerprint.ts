// (C) 2019-2020 GoodData Corporation

import stringify from "json-stable-stringify";
import merge from "lodash/merge.js";
import { IDimension } from "./dimension.js";

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

    const withDefaultTotals: IDimension = merge(dimDefaults, dim);

    return stringify(withDefaultTotals);
}
