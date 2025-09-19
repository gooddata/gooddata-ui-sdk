// (C) 2022-2025 GoodData Corporation

import compact from "lodash/compact.js";
import filter from "lodash/filter.js";
import flow from "lodash/flow.js";
import fromPairs from "lodash/fromPairs.js";
import isArray from "lodash/isArray.js";
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import isObject from "lodash/isObject.js";
import map from "lodash/map.js";
import toPairs from "lodash/toPairs.js";

function isUseless(obj: unknown): boolean {
    return isNil(obj) || (isObject(obj) && isEmpty(obj));
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

    if (isArray(obj)) {
        res = flow(
            (arr) => map(arr, removeUseless),
            (arr) => compact(arr),
        )(obj);
    } else if (isObject(obj)) {
        res = flow(
            toPairs,
            (pairs) => map(pairs, ([key, value]) => [key, removeUseless(value)]),
            (pairs) => filter(pairs, ([_, value]) => !isUseless(value)),
            fromPairs,
        )(obj);
    }

    return isUseless(res) ? undefined : res;
}
