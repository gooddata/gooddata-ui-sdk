// (C) 2025 GoodData Corporation

import { useMemo } from "react";
import { IRichTextWidget, isAbsoluteDateFilter, isObjRef, isRelativeDateFilter } from "@gooddata/sdk-model";

import { selectFilterContextFilters, useDashboardSelector } from "../../../model/index.js";
import { filterContextItemsToDashboardFiltersByRichTextWidget } from "../../../converters/index.js";

export function useRichTextFilters(widget: IRichTextWidget) {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);

    return useMemo(() => {
        //NOTE: This needs to be rework in future into query to be able used ignored filters
        // and other stuff similar to insight widget, this is basically simple select related
        // filters
        let filters = filterContextItemsToDashboardFiltersByRichTextWidget(dashboardFilters, widget);

        // Do not filter by common date filter
        if (!widget.dateDataSet) {
            filters = filters.filter((f) => {
                if (isRelativeDateFilter(f)) {
                    return isObjRef(f.relativeDateFilter.dataSet);
                }
                if (isAbsoluteDateFilter(f)) {
                    return isObjRef(f.absoluteDateFilter.dataSet);
                }
                return true;
            });
        }

        return filters;
    }, [dashboardFilters, widget]);
}
