// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type FilterContextItem,
    type IAutomationVisibleFilter,
    type IDashboardExportParameter,
    type IFilter,
    type IInsight,
    type IWidget,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { useScheduledEmailDialogContext } from "../../../contexts/ScheduledEmailDialogContext.js";
import { shouldStoreExportParameters } from "../../../shared/automationFilters/automationParameters.js";
import {
    getAppliedDashboardFilters,
    getAppliedWidgetFilters,
    getVisibleFiltersByFilters,
    getVisibleFiltersByFiltersByTab,
} from "../../../shared/filters/index.js";

export interface IUseScheduledEmailEffectiveFiltersProps {
    widget?: IWidget;
    insight?: IInsight;
    editedAutomationFilters?: FilterContextItem[];
    editedAutomationFiltersByTab?: Record<string, FilterContextItem[]>;
    availableFiltersAsVisibleFilters?: IAutomationVisibleFilter[] | undefined;
    availableFiltersAsVisibleFiltersByTab?: Record<string, IAutomationVisibleFilter[]>;
    filtersDataByTab?: IAutomationFiltersTab[] | undefined;
    storeFilters?: boolean;
}

/**
 * Derives the filter sets a scheduled export actually runs with: the widget and dashboard filters left
 * after hidden filters are removed, their visible-filter counterparts for display, and the per-tab
 * variants used by multi-tab dashboards.
 *
 * This has to run before the draft exists, because `useScheduledEmailFormState` and
 * `useScheduledEmailExportSettings` consume these values while initializing it. The handlers that
 * *change* filters live in {@link useScheduledEmailFilters} and necessarily run later — they write
 * through the draft's setter. That ordering is why reading and writing filters are two hooks rather
 * than one.
 *
 * @internal
 */
export function useScheduledEmailEffectiveFilters({
    widget,
    insight,
    editedAutomationFilters,
    editedAutomationFiltersByTab,
    availableFiltersAsVisibleFilters,
    availableFiltersAsVisibleFiltersByTab,
    filtersDataByTab,
    storeFilters,
}: IUseScheduledEmailEffectiveFiltersProps): {
    effectiveWidgetFilters: IFilter[];
    effectiveWidgetFiltersWithInsight: IFilter[];
    effectiveVisibleWidgetFilters: IAutomationVisibleFilter[] | undefined;
    effectiveDashboardFilters: FilterContextItem[] | undefined;
    effectiveDashboardFiltersByTab: Record<string, FilterContextItem[]> | undefined;
    effectiveVisibleDashboardFilters: IAutomationVisibleFilter[] | undefined;
    effectiveVisibleDashboardFiltersByTab: Record<string, IAutomationVisibleFilter[]> | undefined;
    parametersByTabForNewAutomation: Record<string, IDashboardExportParameter[]> | undefined;
} {
    const {
        hiddenFilters: dashboardHiddenFilters,
        commonDateFilterId,
        exportParametersByTab: effectiveExportParametersByTab,
    } = useScheduledEmailDialogContext();
    const isWidget = !!widget && !!insight;

    const effectiveWidgetFilters = getAppliedWidgetFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        widget,
        insight,
        commonDateFilterId,
        false,
    );

    const effectiveWidgetFiltersWithInsight = getAppliedWidgetFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        widget,
        insight,
        commonDateFilterId,
        true,
    );

    const effectiveVisibleWidgetFilters = getVisibleFiltersByFilters(
        editedAutomationFilters,
        availableFiltersAsVisibleFilters,
        true,
    );

    const effectiveDashboardFilters = getAppliedDashboardFilters(
        editedAutomationFilters ?? [],
        dashboardHiddenFilters,
        isWidget ? true : storeFilters,
    );

    // Process filters per tab if provided (for dashboard automations with tabs enabled)
    const effectiveDashboardFiltersByTab = useMemo((): Record<string, FilterContextItem[]> | undefined => {
        if (!editedAutomationFiltersByTab || !storeFilters) {
            return undefined;
        }
        // Apply the same processing as effectiveDashboardFilters to each tab's filters
        return Object.entries(editedAutomationFiltersByTab).reduce<Record<string, FilterContextItem[]>>(
            (acc, [tabId, filters]) => {
                const tabHiddenFilters =
                    filtersDataByTab?.find((tab) => tab.tabId === tabId)?.hiddenFilters ?? [];
                const appliedFilters = getAppliedDashboardFilters(
                    filters ?? [],
                    tabHiddenFilters,
                    storeFilters,
                );
                // Only add if we got filters back (storeFilters is true)
                if (appliedFilters) {
                    acc[tabId] = appliedFilters;
                }
                return acc;
            },
            {},
        );
    }, [editedAutomationFiltersByTab, filtersDataByTab, storeFilters]);

    const effectiveVisibleDashboardFilters = getVisibleFiltersByFilters(
        editedAutomationFilters ?? [],
        availableFiltersAsVisibleFilters,
        storeFilters,
    );

    const effectiveVisibleDashboardFiltersByTab = getVisibleFiltersByFiltersByTab(
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFiltersByTab,
        storeFilters,
    );

    // Mirrors the filters seed above, for parameters.
    const parametersByTabForNewAutomation =
        shouldStoreExportParameters(isWidget, storeFilters) &&
        Object.keys(effectiveExportParametersByTab).length > 0
            ? effectiveExportParametersByTab
            : undefined;

    return {
        effectiveWidgetFilters,
        effectiveWidgetFiltersWithInsight,
        effectiveVisibleWidgetFilters,
        effectiveDashboardFilters,
        effectiveDashboardFiltersByTab,
        effectiveVisibleDashboardFilters,
        effectiveVisibleDashboardFiltersByTab,
        parametersByTabForNewAutomation,
    };
}
