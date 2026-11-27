// (C) 2021-2026 GoodData Corporation

import {
    type DashboardDateFilterOfAnyType,
    type ObjRef,
    areObjRefsEqual,
    dashboardFilterObjRef,
} from "@gooddata/sdk-model";

export function canFilterBeAdded(
    addedDateDataSetRef: ObjRef,
    allFilters: DashboardDateFilterOfAnyType[],
): boolean {
    // first filter is always ok, save some useless work upfront
    if (allFilters.length === 0) {
        return true;
    }

    const existingDateDataSets = allFilters.map(dashboardFilterObjRef);

    return !existingDateDataSets.some((existing) => areObjRefsEqual(existing, addedDateDataSetRef));
}
