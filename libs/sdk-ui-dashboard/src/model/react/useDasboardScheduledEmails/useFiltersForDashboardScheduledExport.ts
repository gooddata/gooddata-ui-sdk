// (C) 2024 GoodData Corporation
import {
    FilterContextItem,
    IAutomationMetadataObject,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import {
    ICrossFilteringItem,
    selectCrossFilteringItems,
    selectFilterContextFilters,
    selectOriginalFilterContextFilters,
} from "../../store/index.js";
import { getAutomationDashboardFilters } from "../../../_staging/automation/index.js";
import isEqual from "lodash/isEqual.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

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
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const dashboardFiltersWithoutCrossFiltering = removeCrossFilteringFilters(
        dashboardFilters,
        crossFilteringItems,
    );

    // Only changed filters should be stored in scheduled export
    const dashboardFiltersForScheduledExport = !isEqual(
        originalDashboardFilters,
        dashboardFiltersWithoutCrossFiltering,
    )
        ? dashboardFiltersWithoutCrossFiltering
        : undefined;

    // Saved filters have priority over dashboard filters
    return savedScheduledExportFilters ?? dashboardFiltersForScheduledExport;
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
