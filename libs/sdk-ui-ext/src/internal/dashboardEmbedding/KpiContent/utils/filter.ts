// (C) 2007-2020 GoodData Corporation
import { isDashboardAttributeFilterReference, IWidgetDefinition } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

export function isDateFilterIrrelevant(widget: IWidgetDefinition): boolean {
    const dateDataSetRef = widget.dateDataSet;
    // backward compatibility for old kpis
    const ignoredOldWay = widget.ignoreDashboardFilters.some(
        (filter) =>
            !isDashboardAttributeFilterReference(filter) && areObjRefsEqual(filter.dataSet, dateDataSetRef),
    );
    // now dataSetRef is cleaned
    const checkboxEnabled = !!dateDataSetRef;
    return !checkboxEnabled || ignoredOldWay;
}
