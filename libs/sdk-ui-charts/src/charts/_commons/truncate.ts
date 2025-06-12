// (C) 2019-2020 GoodData Corporation
import isArray from "lodash/isArray.js";

export function truncate<T>(items: T | T[], maxLength: number): T[] {
    if (!items) {
        return [];
    }
    if (isArray(items)) {
        // only get first two attributes
        return items.slice(0, maxLength);
    }
    return [items];
}
