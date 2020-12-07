// (C) 2020 GoodData Corporation
import { areObjRefsEqual, filterObjRef, IFilter, isDateFilter, ObjRef } from "@gooddata/sdk-model";

export function hasDateFilterForDateDataset(filters: IFilter[], dateDataset: ObjRef): boolean {
    return filters.some((filter) => {
        if (!isDateFilter(filter)) {
            return false;
        }

        return areObjRefsEqual(filterObjRef(filter), dateDataset);
    });
}
