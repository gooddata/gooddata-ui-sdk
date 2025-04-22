// (C) 2024-2025 GoodData Corporation
import {
    FilterContextItem,
    IAutomationMetadataObject,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";
import {
    ICrossFilteringItem,
    selectCrossFilteringItems,
    selectEnableAutomationFilterContext,
    selectFilterContextFilters,
    selectOriginalFilterContextFilters,
    selectDefaultFilterOverrides,
} from "../../store/index.js";
import { getAutomationDashboardFilters } from "../../../_staging/automation/index.js";
import isEqual from "lodash/isEqual.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";

/**
 * @alpha
 */
export interface IUseFiltersForDashboardScheduledExportProps {
    /**
     * Optionally provide metadata object to get filters from instead of the current dashboard filters.
     */
    scheduledExportToEdit?: IAutomationMetadataObject;
}

/**
 * Hook for getting filters for dashboard scheduled export.
 *
 * Note:
 * - This function excludes cross-filtering filters, as these are typically not desired in exported reports.
 *
 * - If the current dashboard filters (excluding cross-filtering) match the saved dashboard filters, this hook returns undefined.
 * In such cases, the scheduled export will use the most recent saved dashboard filters, guaranteeing that
 * the export reflects the latest intended filter configuration.
 *
 * - If we are editing an existing scheduled export, this function will return its filters, as changing saved filters is currently not allowed.
 *
 * @alpha
 */
export const useFiltersForDashboardScheduledExport = ({
    scheduledExportToEdit,
}: IUseFiltersForDashboardScheduledExportProps) => {
    const originalDashboardFilters = useDashboardSelector(selectOriginalFilterContextFilters);
    const savedScheduledExportFilters = scheduledExportToEdit
        ? getAutomationDashboardFilters(scheduledExportToEdit)
        : undefined;
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const defaultFilterOverrides = useDashboardSelector(selectDefaultFilterOverrides);
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const dashboardFiltersWithoutCrossFiltering = removeCrossFilteringFilters(
        dashboardFilters,
        crossFilteringItems,
    );
    const enableAutomationFilterContext = useDashboardSelector(selectEnableAutomationFilterContext);

    // Only changed filters should be stored in scheduled export
    const dashboardFiltersForScheduledExport = enableAutomationFilterContext
        ? dashboardFiltersWithoutCrossFiltering
        : // If there are any default filter overrides (e. g. coming from shared dashboard filter context in url),
        // always store them in scheduled export. In this case we won't ever save the default dashboard filter context.
        defaultFilterOverrides || !isEqual(originalDashboardFilters, dashboardFiltersWithoutCrossFiltering)
        ? dashboardFiltersWithoutCrossFiltering
        : undefined;

    const commonDateFilter: FilterContextItem = newAllTimeDashboardDateFilter(
        undefined,
        generateDateFilterLocalIdentifier(0),
    );
    const shouldAddCommonDateFilter =
        enableAutomationFilterContext &&
        dashboardFiltersForScheduledExport &&
        !dashboardFiltersForScheduledExport.some(isDashboardCommonDateFilter);
    const sanitizedDashboardFilters = shouldAddCommonDateFilter
        ? [commonDateFilter, ...dashboardFiltersWithoutCrossFiltering]
        : dashboardFiltersForScheduledExport;

    // Saved filters have priority over dashboard filters
    return savedScheduledExportFilters ?? sanitizedDashboardFilters;
};

const removeCrossFilteringFilters = (
    filters: FilterContextItem[],
    crossFilteringItems: ICrossFilteringItem[],
) => {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap(
        (item) => item.filterLocalIdentifiers,
    );

    return filters.filter((filter) => {
        if (isDashboardAttributeFilter(filter) && filter.attributeFilter.localIdentifier) {
            return !crossFilteringFilterLocalIdentifiers.includes(filter.attributeFilter.localIdentifier);
        }

        return true;
    });
};
