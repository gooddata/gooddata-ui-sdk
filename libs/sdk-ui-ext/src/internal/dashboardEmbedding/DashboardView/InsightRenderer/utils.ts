// (C) 2020-2021 GoodData Corporation
import { IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { IFilter, newAllTimeFilter } from "@gooddata/sdk-model";
import { hasDateFilterForDateDataset } from "../../utils/filters";

export function addImplicitAllTimeFilter(widget: IWidgetDefinition, resolvedFilters: IFilter[]): IFilter[] {
    // if the widget is connected to a dateDataset and has no date filters for it in the context,
    // add an implicit All time filter for that dimension - this will cause the InsightView to ignore
    // any date filters on that dimension - this is how KPI dashboards behave
    if (widget.dateDataSet && !hasDateFilterForDateDataset(resolvedFilters, widget.dateDataSet)) {
        return [...resolvedFilters, newAllTimeFilter(widget.dateDataSet)];
    }
    return resolvedFilters;
}
