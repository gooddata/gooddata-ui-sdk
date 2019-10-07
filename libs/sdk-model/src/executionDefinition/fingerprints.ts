// (C) 2019 GoodData Corporation
import invariant from "ts-invariant";
import { IAttribute } from "../attribute";
import { IDimension } from "../base/dimension";
import { SortItem } from "../base/sort";
import { IFilter } from "../filter";
import { IMeasure } from "../measure";

/**
 * @internal
 */
export function attributeFingerprint(attribute: IAttribute): string {
    invariant(attribute, "attribute must not be undefined");

    return JSON.stringify(attribute);
}

/**
 * @internal
 */
export function filterFingerprint(filter: IFilter): string {
    return JSON.stringify(filter);
}

/**
 * TODO move and hide this; fingerprint calculation only make sense in the context of the entire execution
 *
 * @internal
 */
export function measureFingerprint(measure: IMeasure): string {
    return JSON.stringify(measure);
}

/**
 * @internal
 */
export function dimensionFingerprint(dim: IDimension): string {
    return JSON.stringify(dim);
}

/**
 * @internal
 */
export function sortFingerprint(sort: SortItem): string {
    return JSON.stringify(sort);
}
