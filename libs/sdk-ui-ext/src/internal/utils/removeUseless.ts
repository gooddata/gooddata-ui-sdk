// (C) 2022 GoodData Corporation
import compact from "lodash/fp/compact";
import filter from "lodash/fp/filter";
import flow from "lodash/fp/flow";
import fromPairs from "lodash/fromPairs";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import isObject from "lodash/isObject";
import map from "lodash/fp/map";
import toPairs from "lodash/toPairs";

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
        res = flow(map(removeUseless), compact)(obj);
    } else if (isObject(obj)) {
        res = flow(
            toPairs,
            map(([key, value]) => [key, removeUseless(value)]),
            filter(([_, value]) => !isUseless(value)),
            fromPairs,
        )(obj);
    }

    return isUseless(res) ? undefined : res;
}
