// (C) 2020-2026 GoodData Corporation

import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

interface IDisplayFormRef {
    ref: ObjRef;
}

export function findDashboardAttributeFilterByDisplayForm(
    dashboardAttributeFilters: IDashboardAttributeFilter[],
    displayForm: ObjRef,
): IDashboardAttributeFilter | undefined {
    return dashboardAttributeFilters.find((dashboardFilter) =>
        areObjRefsEqual(dashboardFilter.attributeFilter.displayForm, displayForm),
    );
}

export function findDashboardAttributeFilterByAttributeDisplayForms(
    dashboardAttributeFilters: IDashboardAttributeFilter[],
    attributeDisplayForms: IDisplayFormRef[],
): IDashboardAttributeFilter | undefined {
    for (const displayForm of attributeDisplayForms) {
        const matchingDashboardFilter = findDashboardAttributeFilterByDisplayForm(
            dashboardAttributeFilters,
            displayForm.ref,
        );

        if (matchingDashboardFilter) {
            return matchingDashboardFilter;
        }
    }

    return undefined;
}

export function findDashboardAttributeFilterByIncomingDisplayAsLabel(
    attributeFilter: IDashboardAttributeFilter,
    attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    dashboardAttributeFilters: IDashboardAttributeFilter[],
): IDashboardAttributeFilter | undefined {
    const filterConfig = attributeFilterConfigs.find(
        (config) => config.localIdentifier === attributeFilter.attributeFilter.localIdentifier,
    );

    if (!filterConfig?.displayAsLabel) {
        return undefined;
    }

    return findDashboardAttributeFilterByDisplayForm(dashboardAttributeFilters, filterConfig.displayAsLabel);
}

export function findDashboardAttributeFilterByTargetDisplayAsLabel(
    filterRef: ObjRef,
    dashboardAttributeFilters: IDashboardAttributeFilter[],
    dashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[],
): IDashboardAttributeFilter | undefined {
    const matchingDashboardFilterConfig = dashboardAttributeFilterConfigs.find((config) =>
        areObjRefsEqual(config.displayAsLabel, filterRef),
    );

    if (!matchingDashboardFilterConfig) {
        return undefined;
    }

    return dashboardAttributeFilters.find(
        (dashboardFilter) =>
            dashboardFilter.attributeFilter.localIdentifier === matchingDashboardFilterConfig.localIdentifier,
    );
}
