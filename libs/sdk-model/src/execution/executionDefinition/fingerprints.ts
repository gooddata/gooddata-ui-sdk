// (C) 2019-2021 GoodData Corporation
import stringify from "json-stable-stringify";
import { invariant } from "ts-invariant";
import { IAttribute } from "../attribute/index.js";
import { ISortItem } from "../base/sort.js";

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
export function sortFingerprint(sort: ISortItem): string {
    return stringify(sort);
}

/**
 * @internal
 */
export function dataSamplingFingerprint(dataSamplingPercentage: number | undefined): string {
    // Since data sampling is optional, we will have to handle undefined by returning a string
    return dataSamplingPercentage ? dataSamplingPercentage.toString() : "undefined";
}
