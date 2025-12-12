// (C) 2023-2025 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import {
    selectDateFilterConfigOverrides,
    selectDateFilterConfigOverridesByTab,
    selectDateFilterConfigsOverrides,
    selectDateFilterConfigsOverridesByTab,
    useDashboardSelector,
} from "../../model/index.js";

export const useCurrentDateFilterConfig = (
    dateDataSet: ObjRef | undefined,
    defaultDateFilterTitle: string,
    tabId?: string,
) => {
    // Use tab-specific selectors when tabId is provided
    const dateFilterConfigOverridesByTab = useDashboardSelector(selectDateFilterConfigOverridesByTab);
    const dateFilterConfigOverridesFromActiveTab = useDashboardSelector(selectDateFilterConfigOverrides);
    const filterConfig = tabId
        ? dateFilterConfigOverridesByTab[tabId]
        : dateFilterConfigOverridesFromActiveTab;

    const dateFilterConfigsOverridesByTab = useDashboardSelector(selectDateFilterConfigsOverridesByTab);
    const dateFilterConfigsOverridesFromActiveTab = useDashboardSelector(selectDateFilterConfigsOverrides);
    const filterConfigByDimension = tabId
        ? (dateFilterConfigsOverridesByTab[tabId] ?? [])
        : dateFilterConfigsOverridesFromActiveTab;

    const usedConfig = dateDataSet
        ? filterConfigByDimension.find((config) => areObjRefsEqual(config.dateDataSet, dateDataSet))?.config
        : filterConfig;

    const originalTitle =
        !usedConfig || usedConfig?.filterName === "" ? defaultDateFilterTitle : usedConfig?.filterName;

    return {
        mode: usedConfig?.mode ?? "active",
        title: originalTitle,
    };
};
