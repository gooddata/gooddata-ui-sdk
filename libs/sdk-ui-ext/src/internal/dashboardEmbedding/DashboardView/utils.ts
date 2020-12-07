// (C) 2020 GoodData Corporation
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    filterObjRef,
    IFilter,
    isDateFilter,
    newAllTimeFilter,
    ObjRef,
} from "@gooddata/sdk-model";

export function hasDateFilterForDateDataset(filters: IFilter[], dateDataset: ObjRef): boolean {
    return filters.some((filter) => {
        if (!isDateFilter(filter)) {
            return false;
        }

        return areObjRefsEqual(filterObjRef(filter), dateDataset);
    });
}

export function addImplicitAllTimeFilter(widget: IWidgetDefinition, resolvedFilters: IFilter[]): IFilter[] {
    // if the widget is connected to a dateDataset and has no date filters for it in the context,
    // add an implicit All time filter for that dimension - this will cause the InsightView to ignore
    // any date filters on that dimension - this is how KPI dashboards behave
    if (widget.dateDataSet && !hasDateFilterForDateDataset(resolvedFilters, widget.dateDataSet)) {
        return [...resolvedFilters, newAllTimeFilter(widget.dateDataSet)];
    }
    return resolvedFilters;
}
