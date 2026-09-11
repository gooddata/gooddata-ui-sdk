// (C) 2026 GoodData Corporation

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type ObjRef,
    type ObjectType,
    areObjRefsEqual,
    dashboardFilterObjRef,
    isDashboardAttributeFilterItem,
    isDashboardDateFilterWithDimension,
    isDashboardMeasureValueFilter,
} from "@gooddata/sdk-model";

export function isDashboardObjectRestricted(
    ref: ObjRef,
    type: ObjectType,
    unavailableObjects: IUnavailableDashboardReference[],
): boolean {
    return unavailableObjects.some(
        (object) => object.reason === "forbidden" && object.type === type && areObjRefsEqual(object.ref, ref),
    );
}

function dashboardFilterObjectType(filter: FilterContextItem): ObjectType | undefined {
    if (isDashboardAttributeFilterItem(filter)) {
        return "displayForm";
    }
    if (isDashboardDateFilterWithDimension(filter)) {
        return "dataSet";
    }
    if (isDashboardMeasureValueFilter(filter)) {
        return "measure";
    }
    return undefined;
}

export function isDashboardFilterRestricted(
    filter: FilterContextItem,
    unavailableObjects: IUnavailableDashboardReference[],
): boolean {
    const ref = dashboardFilterObjRef(filter);
    const type = dashboardFilterObjectType(filter);

    return (
        ref !== undefined && type !== undefined && isDashboardObjectRestricted(ref, type, unavailableObjects)
    );
}
