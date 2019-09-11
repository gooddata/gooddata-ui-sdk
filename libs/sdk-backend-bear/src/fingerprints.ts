// (C) 2019 GoodData Corporation

import { IAttribute, IDimension, IFilter, IMeasure, ITotal, SortItem } from "@gooddata/sdk-model";

/*
 * These are simple fingerprinters that can produce false negatives => fingerprints different but the
 * backend processing yields same results. Not a functional issue as the backend can deal with it and
 * reuse caches anyway.
 */

export function attributeFingerprint(attribute: IAttribute): string {
    return JSON.stringify(attribute);
}

export function measureFingerprint(measure: IMeasure): string {
    return JSON.stringify(measure);
}

export function filterFingerprint(filter: IFilter): string {
    return JSON.stringify(filter);
}

export function sortFingerprint(sort: SortItem): string {
    return JSON.stringify(sort);
}

export function totalFingerprint(total: ITotal): string {
    return JSON.stringify(total);
}

export function dimensionFingerprint(dim: IDimension): string {
    return JSON.stringify(dim);
}
