// (C) 2026 GoodData Corporation

import {
    type IDateRangeParameterMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    getParameterTitle,
} from "@gooddata/sdk-model";

/**
 * The catalog's period (a DATE_RANGE parameter) that a date filter references. The catalog does not have it
 * when the `enableDateRangeParameters` setting is off or the period was deleted.
 */
export function findPeriod(
    ref: ObjRef,
    dateRangeParameters: ReadonlyArray<IDateRangeParameterMetadataObject> | undefined,
): IDateRangeParameterMetadataObject | undefined {
    return dateRangeParameters?.find((dateRangeParameter) => areObjRefsEqual(dateRangeParameter.ref, ref));
}

/** The title of the period a date filter references, or its id when the catalog does not have the period. */
export function getPeriodTitle(
    ref: ObjRef,
    dateRangeParameters: ReadonlyArray<IDateRangeParameterMetadataObject> | undefined,
): string {
    return getParameterTitle(ref, findPeriod(ref, dateRangeParameters));
}
