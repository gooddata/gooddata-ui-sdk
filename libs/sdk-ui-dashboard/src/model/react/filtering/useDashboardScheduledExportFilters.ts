// (C) 2024-2025 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";

import { useAutomationAvailableDashboardFilters } from "./useAutomationAvailableDashboardFilters.js";
import { getAutomationDashboardFilters } from "../../../_staging/automation/index.js";

/**
 * @deprecated - can be removed, once `enableAutomationFilterContext` is removed
 */
export interface IUseDashboardScheduledExportFiltersProps {
    /**
     * Optionally provide metadata object to get filters from instead of the current dashboard filters.
     */
    scheduledExportToEdit?: IAutomationMetadataObject;
}

/**
 * Hook for getting filters for dashboard scheduled export.
 *
 * If scheduledExportToEdit is provided, it returns its saved filters as is.
 * If scheduledExportToEdit is not provided, it returns sanitized filters ready to be saved in new scheduled export.
 *
 * @deprecated - can be removed, once `enableAutomationFilterContext` is removed
 */
export const useDashboardScheduledExportFilters = ({
    scheduledExportToEdit,
}: IUseDashboardScheduledExportFiltersProps) => {
    const savedScheduledExportFilters = scheduledExportToEdit
        ? getAutomationDashboardFilters(scheduledExportToEdit)
        : undefined;

    const availableDashboardFilters = useAutomationAvailableDashboardFilters();

    return savedScheduledExportFilters ?? availableDashboardFilters;
};
