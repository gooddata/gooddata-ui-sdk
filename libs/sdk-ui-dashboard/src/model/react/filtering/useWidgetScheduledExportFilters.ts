// (C) 2020-2025 GoodData Corporation

import { IAutomationMetadataObjectDefinition, IFilter, IInsightDefinition } from "@gooddata/sdk-model";
import { getAutomationVisualizationFilters } from "../../../_staging/automation/index.js";
import { FilterableDashboardWidget } from "../../types/layoutTypes.js";
import { QueryProcessingState } from "../useDashboardQueryProcessing.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { selectCrossFilteringItems } from "../../store/drill/drillSelectors.js";
import { useEnableAlertingAutomationFilterContext } from "../useDashboardAlerting/useEnableAutomationFilterContext.js";
import { useWidgetFilters } from "../useWidgetFilters.js";
import { sanitizeWidgetFilters } from "./shared.js";

/**
 * @alpha
 */
export interface IUseWidgetScheduledExportFiltersProps {
    /**
     * Optionally provide metadata object to get filters from instead of the current widget filters.
     */
    scheduledExportToEdit?: IAutomationMetadataObjectDefinition;

    /**
     * Widget to get filters for.
     */
    widget?: FilterableDashboardWidget;

    /**
     * Insight to get filters for.
     */
    insight?: IInsightDefinition;
}

/**
 * Returns filters for widget scheduled export.
 *
 * - In case of existing scheduled export, it returns the saved filters from the scheduled export.
 * - Otherwise, it returns the filters ready to be saved in new scheduled export, sanitized according to the following rules:
 *     - Cross-filtering filters are excluded as they are typically not desired in the scheduled export.
 *     - The widget's ignored filters configuration is honored (ignored filters are not overridden by dashboard filters and remain as is).
 *     - If the resulting filters include all-time date filter, it is excluded as it has no effect on the scheduled export execution.
 *     - If the resulting filters include empty attribute filters, they are excluded as they have no effect on the scheduled export execution.
 *
 * @alpha
 */
export function useWidgetScheduledExportFilters({
    scheduledExportToEdit,
    widget,
    insight,
}: IUseWidgetScheduledExportFiltersProps): QueryProcessingState<IFilter[]> {
    const newScheduledExportFiltersQuery = useFiltersForNewWidgetScheduledExport(widget, insight);

    const existingWidgetScheduledExportFilters = getAutomationVisualizationFilters(scheduledExportToEdit);

    if (existingWidgetScheduledExportFilters) {
        return {
            result: existingWidgetScheduledExportFilters,
            error: undefined,
            status: "success",
        };
    }

    return newScheduledExportFiltersQuery;
}

/**
 * @internal
 */
function useFiltersForNewWidgetScheduledExport(
    widget?: FilterableDashboardWidget,
    insight?: IInsightDefinition,
): QueryProcessingState<IFilter[]> {
    const widgetFiltersQuery = useWidgetFilters(widget, insight);
    const { result: widgetFilters, status: widgetFiltersStatus } = widgetFiltersQuery;

    const enableAutomationFilterContext = useEnableAlertingAutomationFilterContext();
    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);

    const sanitizedWidgetFilters = widgetFilters
        ? sanitizeWidgetFilters(widgetFilters, crossFilteringItems, enableAutomationFilterContext)
        : undefined;

    if (widgetFiltersStatus === "success" && sanitizedWidgetFilters) {
        return {
            result: sanitizedWidgetFilters,
            error: undefined,
            status: "success",
        };
    }

    return widgetFiltersQuery;
}
