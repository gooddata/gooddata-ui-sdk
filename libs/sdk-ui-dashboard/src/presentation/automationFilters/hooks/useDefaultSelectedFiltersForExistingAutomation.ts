// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import {
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationVisibleFilter,
    dashboardFilterLocalIdentifier,
    filterLocalIdentifier,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import {
    getAutomationAlertFilters,
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { dashboardFilterToFilterContextItem } from "../../../_staging/dashboard/dashboardFilterContext.js";
import {
    ExtendedDashboardWidget,
    removeIgnoredWidgetFilters,
    selectAutomationAvailableDashboardFilters,
    selectAutomationCommonDateFilterId,
    useDashboardSelector,
} from "../../../model/index.js";
import { IDashboardFilter, isDashboardFilter } from "../../../types.js";

export function useDefaultSelectedFiltersForExistingAutomation(
    automationToEdit?: IAutomationMetadataObject,
    availableVisibleFilters?: IAutomationVisibleFilter[],
    widget?: ExtendedDashboardWidget,
) {
    const availableDashboardFilters = useDashboardSelector(selectAutomationAvailableDashboardFilters);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);

    const savedWidgetAlertFilters = getAutomationAlertFilters(automationToEdit);
    const {
        executionFilters: savedWidgetScheduleFilters,
        filterContextItems: savedWidgetScheduleFilterContextItems,
    } = getAutomationVisualizationFilters(automationToEdit);
    const savedDashboardScheduleFilters = getAutomationDashboardFilters(automationToEdit);

    // Convert saved filters to FilterContextItem[] with correct titles
    const savedFilterContextItems = useMemo(() => {
        const savedAutomationWidgetFilters = savedWidgetAlertFilters ?? savedWidgetScheduleFilters;
        const convertedSavedWidgetFilters = savedAutomationWidgetFilters
            ?.filter(isDashboardFilter)
            .map((filter) => convertAndSanitizeFilter(filter, availableVisibleFilters));

        return (
            savedDashboardScheduleFilters ??
            savedWidgetScheduleFilterContextItems ??
            convertedSavedWidgetFilters
        );
    }, [
        savedWidgetAlertFilters,
        savedWidgetScheduleFilters,
        savedWidgetScheduleFilterContextItems,
        savedDashboardScheduleFilters,
        availableVisibleFilters,
    ]);

    const availableWidgetFilters = removeIgnoredWidgetFilters(availableDashboardFilters, widget);

    const savedVisibleFilters = automationToEdit?.metadata?.visibleFilters ?? [];

    return savedVisibleFilters
        ? getDefaultSelectedFiltersByVisibleFilters(
              savedVisibleFilters,
              availableWidgetFilters,
              savedFilterContextItems,
              commonDateFilterId,
          )
        : [];
}

/**
 * Reconstructs default filters selection for the AutomationFiltersSelect component from existing widget automation.
 * This is done by mapping saved visible filters metadata, with relevant saved automation filters or dashboard filters.
 * Unsuccessful mapping (eg if some filters are missing etc.) should be ok, in case of invalid filters (validated by useAutomationFiltersValidation),
 * ApplyLatestFiltersConfirmDialog will be shown to the user, and editing will be available only after user confirms to apply current dashboard filters.
 *
 * @internal
 */
function getDefaultSelectedFiltersByVisibleFilters(
    savedVisibleFilters: IAutomationVisibleFilter[],
    availableWidgetFilters: FilterContextItem[],
    savedAutomationFilters?: FilterContextItem[],
    commonDateFilterId?: string,
) {
    return savedVisibleFilters.flatMap((visibleFilter): FilterContextItem | FilterContextItem[] => {
        // Find relevant available widget filter by local identifier
        const targetDashboardFilter = availableWidgetFilters?.find(
            (f) => visibleFilter.localIdentifier === dashboardFilterLocalIdentifier(f),
        );

        // Find relevant saved automation filter by local identifier
        const savedFilter = savedAutomationFilters?.find(
            (f) => visibleFilter.localIdentifier === dashboardFilterLocalIdentifier(f),
        );

        if (
            commonDateFilterId &&
            visibleFilter.localIdentifier === commonDateFilterId &&
            visibleFilter.isAllTimeDateFilter
        ) {
            // If the visible filter is the common date filter and it's all-time,
            // return the all-time common date filter (all-time filters are not saved)
            // Common date filter is recognized by missing dateDataSet, so we need to set it to undefined
            return newAllTimeDashboardDateFilter(undefined, visibleFilter.localIdentifier);
        } else if (
            commonDateFilterId &&
            visibleFilter.localIdentifier === commonDateFilterId &&
            isDashboardDateFilter(savedFilter)
        ) {
            // If the visible filter is the common date filter and it's not all-time,
            // return the saved common date filter.
            // Common date filter is recognized by missing dateDataSet, so we need to set it to undefined
            return {
                ...savedFilter,
                dateFilter: {
                    ...savedFilter.dateFilter,
                    dataSet: undefined,
                },
            };
        } else if (visibleFilter.isAllTimeDateFilter && isDashboardDateFilter(targetDashboardFilter)) {
            // If visible filter is all-time date filter, it's not saved, so we need to get it from the available widget filters.
            // As it is not common date filter, we need to set the proper dateDataSet to it.
            return newAllTimeDashboardDateFilter(
                targetDashboardFilter.dateFilter.dataSet,
                visibleFilter.localIdentifier,
            );
        }

        // Rest of the filters should be saved, so match them by local identifier.
        return (
            savedAutomationFilters?.find(
                (savedFilter) =>
                    visibleFilter.localIdentifier === dashboardFilterLocalIdentifier(savedFilter),
            ) ?? []
        );
    });
}

function convertAndSanitizeFilter(
    filter: IDashboardFilter,
    availableVisibleFilters?: IAutomationVisibleFilter[],
) {
    const convertedItem = dashboardFilterToFilterContextItem(filter, true);

    // Because execution filters do not include titles, and they cannot be saved there,
    // get them from the current available visible filters.
    const titleToUse = availableVisibleFilters?.find(
        (visibleFilter) => visibleFilter.localIdentifier === filterLocalIdentifier(filter),
    );

    return isDashboardAttributeFilter(convertedItem)
        ? {
              ...convertedItem,
              attributeFilter: {
                  ...convertedItem.attributeFilter,
                  title: titleToUse?.title,
              },
          }
        : {
              ...convertedItem,
              dateFilter: {
                  ...convertedItem.dateFilter,
                  title: titleToUse?.title,
              },
          };
}
