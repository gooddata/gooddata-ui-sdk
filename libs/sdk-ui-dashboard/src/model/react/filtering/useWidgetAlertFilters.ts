// (C) 2020-2025 GoodData Corporation
import { IAutomationMetadataObjectDefinition, IFilter, IInsightDefinition } from "@gooddata/sdk-model";
import { useWidgetFilters } from "../useWidgetFilters.js";
import { FilterableDashboardWidget } from "../../types/layoutTypes.js";
import { QueryProcessingState } from "../useDashboardQueryProcessing.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { selectCrossFilteringItems } from "../../store/drill/drillSelectors.js";
import { useEnableAlertingAutomationFilterContext } from "../useDashboardAlerting/useEnableAutomationFilterContext.js";
import { sanitizeWidgetFilters } from "./shared.js";

/**
 * @alpha
 */
export interface IUseWidgetAlertFiltersProps {
    /**
     * Optionally provide metadata object to get filters from instead of the current widget filters.
     */
    alertToEdit?: IAutomationMetadataObjectDefinition;

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
 * Hook for getting filters for widget alert.
 *
 * Note:
 * - In case of existing widget alert, it returns the saved filters from the widget alert.
 * - Otherwise, it returns the filters ready to be saved in new widget alert, sanitized according to the following rules:
 *     - Cross-filtering filters are excluded as they are typically not desired in the widget alert.
 *     - The widget's ignored filters configuration is honored (ignored filters are not overridden by dashboard filters and remain as is).
 *     - If the resulting filters include all-time date filter, it is excluded as it has no effect on the widget alert execution.
 *     - If the resulting filters include empty attribute filters, they are excluded as they have no effect on the widget alert execution.
 *
 * @alpha
 */
export function useWidgetAlertFilters({
    alertToEdit,
    widget,
    insight,
}: IUseWidgetAlertFiltersProps): QueryProcessingState<IFilter[]> {
    const newScheduledExportFiltersQuery = useFiltersForNewWidgetAlert(widget, insight);
    const existingWidgetScheduledExportFilters = alertToEdit?.alert?.execution?.filters;

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
function useFiltersForNewWidgetAlert(
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
