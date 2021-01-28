// (C) 2020-2021 GoodData Corporation
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    filterObjRef,
    IFilter,
    isDateFilter,
    newAllTimeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { DashboardViewLayoutWidgetClass } from "../DashboardLayout/interfaces/dashboardLayoutSizing";

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

const typeVisTypeCssClassMapping: {
    [widgetClass in DashboardViewLayoutWidgetClass]?: string;
} = {
    kpi: "viz-type-kpi",
    headline: "viz-type-headline",
    xirr: "viz-type-xirr",
    column: "viz-type-column",
    bar: "viz-type-bar",
    line: "viz-type-line",
    area: "viz-type-area",
    combo: "viz-type-combo",
    combo2: "viz-type-combo2",
    scatter: "viz-type-scatter",
    bubble: "viz-type-bubble",
    pie: "viz-type-pie",
    donut: "viz-type-donut",
    treemap: "viz-type-treemap",
    heatmap: "viz-type-heatmap",
    table: "viz-type-table",
    pushpin: "viz-type-pushpin",
};

export function getVisTypeCssClass(type: DashboardViewLayoutWidgetClass): string {
    return typeVisTypeCssClassMapping[type] ?? "";
}
