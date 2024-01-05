// (C) 2021-2022 GoodData Corporation
import { areObjRefsEqual, ObjRef, IDashboardDateFilter } from "@gooddata/sdk-model";

export async function canFilterBeAdded(
    addedDateDataSetRef: ObjRef,
    allFilters: IDashboardDateFilter[],
): Promise<boolean> {
    // first filter is always ok, save some useless work upfront
    if (allFilters.length === 0) {
        return true;
    }

    const existingDateDataSets = allFilters.map((df) => df.dateFilter.dataSet);

    return !existingDateDataSets.some((existing) => areObjRefsEqual(existing, addedDateDataSetRef));
}
