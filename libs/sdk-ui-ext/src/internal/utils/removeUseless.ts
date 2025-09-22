// (C) 2022-2025 GoodData Corporation

import { compact, filter, flow, isEmpty, map } from "lodash-es";

function isUseless(obj: unknown): boolean {
    return obj === null || obj === undefined || (typeof obj === "object" && isEmpty(obj));
}

/**
 * For a given object returns a copy that has all properties that are empty objects or arrays or nil removed.
 * This is applied recursively.
 *
 * @param obj - object to handle
 * @returns always a new instance if obj is not scalar
 */
export function removeUseless(obj: any): any | undefined {
    let res = obj;

    if (Array.isArray(obj)) {
        res = flow(
            (arr) => map(arr, removeUseless),
            (arr) => compact(arr),
        )(obj);
    } else if (obj !== null && typeof obj === "object") {
        res = flow(
            Object.entries,
            (pairs) => map(pairs, ([key, value]) => [key, removeUseless(value)]),
            (pairs) => filter(pairs, ([_, value]) => !isUseless(value)),
            Object.fromEntries,
        )(obj);
    }

    return isUseless(res) ? undefined : res;
}
