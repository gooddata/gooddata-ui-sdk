// (C) 2019-2020 GoodData Corporation
import stringify from "json-stable-stringify";
import invariant from "ts-invariant";
import { IAttribute } from "../attribute";
import { SortItem } from "../base/sort";

/**
 * @internal
 */
export function attributeFingerprint(attribute: IAttribute): string {
    invariant(attribute, "attribute must not be undefined");

    return stringify(attribute);
}

/**
 * @internal
 */
export function sortFingerprint(sort: SortItem): string {
    return stringify(sort);
}
