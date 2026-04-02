// (C) 2026 GoodData Corporation

import { type ISeriesDataItem } from "../typings/unsafe.js";

/**
 * Removes consecutive items with `y === 0` from the beginning of the array.
 * Used for funnel charts to skip leading zero-value entries.
 */
export function skipLeadingZeros(values: ISeriesDataItem[]): ISeriesDataItem[] {
    const firstNonZero = values.findIndex((item) => item.y !== 0);

    if (firstNonZero === 0 || values.length === 0) {
        return values;
    }

    return firstNonZero === -1 ? [] : values.slice(firstNonZero);
}

/**
 * Recursively replaces `null` / `undefined` values of `y` with `0` in a series data tree.
 * Used for waterfall charts where Highcharts needs numeric values instead of nulls.
 */
export function coalesceNulls(value: ISeriesDataItem): ISeriesDataItem {
    const hasNestedData = value.data != null && value.data.length > 0;
    const data = hasNestedData ? value.data!.map(coalesceNulls) : value.data;

    if ("y" in value && value.y == null) {
        return { ...value, data, y: 0 };
    }

    // only allocate a new object if the data actually changed, otherwise reuse existing object
    return data === value.data ? value : { ...value, data };
}
