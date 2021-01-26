// (C) 2007-2021 GoodData Corporation
import {
    isDashboardAttributeFilterReference,
    isDashboardDateFilterReference,
    IUserWorkspaceSettings,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    IFilter,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isDateFilter,
    isRelativeDateFilter,
    ObjRef,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import last from "lodash/last";

export function isAttributeFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) =>
            isDashboardAttributeFilterReference(filter) && areObjRefsEqual(filter.displayForm, displayForm),
    );
}

export function isDateFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) => isDashboardDateFilterReference(filter) && areObjRefsEqual(filter.dataSet, displayForm),
    );
}

export function isDateFilterIrrelevant(widget: IWidgetDefinition): boolean {
    const dateDataSetRef = widget.dateDataSet;
    // backward compatibility for old kpis
    const ignoredOldWay = isDateFilterIgnored(widget, dateDataSetRef);
    // now dataSetRef is cleaned
    const checkboxEnabled = !!dateDataSetRef;
    return !checkboxEnabled || ignoredOldWay;
}

export function isAlertingTemporarilyDisabledForGivenFilter(
    kpi: IWidgetDefinition,
    filters: IFilter[],
    userWorkspaceSettings: IUserWorkspaceSettings | undefined,
): boolean {
    const hasDateDataSet = !!kpi.dateDataSet;
    if (!hasDateDataSet) {
        // for KPI's not connected to a dateDataSet, the filter config is irrelevant -> alerts are never disabled
        return false;
    }

    const effectiveDateFilter = last(filters.filter(isDateFilter));
    if (!effectiveDateFilter || isAllTimeDateFilter(effectiveDateFilter)) {
        return false;
    }

    const isAfmExecutorEnabled = !!userWorkspaceSettings?.["kpi.alerting.useAfmExecutor"];
    if (isAfmExecutorEnabled) {
        // AfmExecutor supports all filters except static ranges
        return isAbsoluteDateFilter(effectiveDateFilter);
    } else {
        // we only allow the alerts for backwards-compatible filters now
        // i.e. relative presets without exclude current period selected
        if (!isRelativeDateFilter(effectiveDateFilter)) {
            return true;
        }

        const { from, to } = relativeDateFilterValues(effectiveDateFilter);

        const endsInPreviousPeriod = to === -1; // ends in previous period
        const isLongerThanOnePeriod = from !== to; // but is not only that period (e.g. last year)

        return endsInPreviousPeriod && isLongerThanOnePeriod;
    }
}
