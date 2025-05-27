// (C) 2022-2025 GoodData Corporation
import { IAutomationMetadataObject, IInsight } from "@gooddata/sdk-model";
import { useWidgetScheduledExportFilters } from "./useWidgetScheduledExportFilters.js";
import { FilterableDashboardWidget } from "../../types/layoutTypes.js";
import { useDashboardScheduledExportFilters } from "./useDashboardScheduledExportFilters.js";

/**
 * @deprecated - can be removed, once `enableAutomationFilterContext` is removed
 * @alpha
 */
export interface IUseScheduledExportFiltersProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
    widget?: FilterableDashboardWidget;
    insight?: IInsight;
}

/**
 * Returns filters for scheduled export.
 *
 * If scheduledExportToEdit is provided, it returns its saved filters as is.
 * If scheduledExportToEdit is not provided, it returns sanitized filters ready to be saved in new scheduled export.
 *
 * @deprecated - can be removed, once `enableAutomationFilterContext` is removed
 * @alpha
 */
export const useScheduledExportFilters = ({
    scheduledExportToEdit,
    widget,
    insight,
}: IUseScheduledExportFiltersProps) => {
    const {
        result: widgetFilters,
        error: widgetFiltersError,
        status,
    } = useWidgetScheduledExportFilters({ scheduledExportToEdit, widget, insight });

    const dashboardFilters = useDashboardScheduledExportFilters({ scheduledExportToEdit });

    const widgetFiltersLoading = widget ? status === "pending" || status === "running" : false;

    return {
        widgetFilters,
        widgetFiltersLoading,
        widgetFiltersError,
        dashboardFilters,
    };
};
