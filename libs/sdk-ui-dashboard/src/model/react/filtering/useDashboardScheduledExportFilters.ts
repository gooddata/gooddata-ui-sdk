// (C) 2024-2025 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { getAutomationDashboardFilters } from "../../../_staging/automation/index.js";
import { useAutomationAvailableDashboardFilters } from "./useAutomationAvailableDashboardFilters.js";

/**
 * @alpha
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
 * @alpha
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
