// (C) 2021-2026 GoodData Corporation

import { type IDashboardDateFilter, type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

export function canFilterBeAdded(addedDateDataSetRef: ObjRef, allFilters: IDashboardDateFilter[]): boolean {
    // first filter is always ok, save some useless work upfront
    if (allFilters.length === 0) {
        return true;
    }

    const existingDateDataSets = allFilters.map((df) => df.dateFilter.dataSet);

    return !existingDateDataSets.some((existing) => areObjRefsEqual(existing, addedDateDataSetRef));
}
