// (C) 2020-2026 GoodData Corporation

import { useEffect } from "react";

import {
    type FilterContextItem,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    areObjRefsEqual,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import {
    getTargetDashboardFiltersCacheKey,
    useTargetDashboardFiltersContext,
} from "./TargetDashboardFiltersContext.js";
import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectDashboardRef } from "../../../../../model/store/meta/metaSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextFilters } from "../../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillToDashboardConfig,
} from "../../../../drill/types.js";

interface IUseFetchTargetDashboardFiltersResult {
    targetDashboardFilters: FilterContextItem[];
    targetDashboardAttributeFilters: IDashboardAttributeFilter[];
    targetDashboardAttributeFilterConfigs: IDashboardAttributeFilterConfig[];
    isLoading: boolean;
}

export function useFetchTargetDashboardFilters(
    item: IDrillConfigItem,
): IUseFetchTargetDashboardFiltersResult {
    const sourceDashboardRef = useDashboardSelector(selectDashboardRef);
    const sourceDashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const sourceDashboardAttributeFilterConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const { cache, fetchTargetDashboardFilters } = useTargetDashboardFiltersContext();
    const isDrillToDashboard = item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD;
    const drillToDashboardItem = isDrillToDashboard ? (item as IDrillToDashboardConfig) : undefined;
    const targetDashboardRef = drillToDashboardItem?.dashboard;
    const targetDashboardTab = drillToDashboardItem?.dashboardTab;
    const isDrillToCurrentDashboard =
        !targetDashboardRef ||
        (sourceDashboardRef ? areObjRefsEqual(sourceDashboardRef, targetDashboardRef) : false);
    const targetDashboardFiltersCacheKey = targetDashboardRef
        ? getTargetDashboardFiltersCacheKey(targetDashboardRef, targetDashboardTab)
        : undefined;
    const targetDashboardFiltersCacheEntry = targetDashboardFiltersCacheKey
        ? cache[targetDashboardFiltersCacheKey]
        : undefined;
    const hasTargetDashboardFiltersCacheEntry = !!targetDashboardFiltersCacheEntry;

    useEffect(() => {
        if (!isDrillToDashboard || isDrillToCurrentDashboard || !targetDashboardRef) {
            return;
        }

        if (hasTargetDashboardFiltersCacheEntry) {
            return;
        }

        fetchTargetDashboardFilters(targetDashboardRef, targetDashboardTab);
    }, [
        fetchTargetDashboardFilters,
        hasTargetDashboardFiltersCacheEntry,
        isDrillToCurrentDashboard,
        isDrillToDashboard,
        targetDashboardRef,
        targetDashboardTab,
    ]);

    if (!isDrillToDashboard) {
        return {
            targetDashboardFilters: [],
            targetDashboardAttributeFilters: [],
            targetDashboardAttributeFilterConfigs: [],
            isLoading: false,
        };
    }

    if (isDrillToCurrentDashboard) {
        return {
            targetDashboardFilters: sourceDashboardFilters,
            targetDashboardAttributeFilters: sourceDashboardFilters.filter(isDashboardAttributeFilter),
            targetDashboardAttributeFilterConfigs: sourceDashboardAttributeFilterConfigs,
            isLoading: false,
        };
    }

    return {
        targetDashboardFilters: targetDashboardFiltersCacheEntry?.targetDashboardFilters ?? [],
        targetDashboardAttributeFilters:
            targetDashboardFiltersCacheEntry?.targetDashboardAttributeFilters ?? [],
        targetDashboardAttributeFilterConfigs:
            targetDashboardFiltersCacheEntry?.targetDashboardAttributeFilterConfigs ?? [],
        isLoading: !targetDashboardFiltersCacheEntry || targetDashboardFiltersCacheEntry.status === "loading",
    };
}
