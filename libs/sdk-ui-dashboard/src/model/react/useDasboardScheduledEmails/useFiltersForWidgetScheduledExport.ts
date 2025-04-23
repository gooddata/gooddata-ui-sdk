// (C) 2020-2025 GoodData Corporation

import {
    filterLocalIdentifier,
    IAutomationMetadataObjectDefinition,
    IFilter,
    IInsightDefinition,
    isAllTimeDateFilter,
    newAllTimeFilter,
} from "@gooddata/sdk-model";
import { useWidgetFilters } from "../useWidgetFilters.js";
import { getAutomationVisualizationFilters } from "../../../_staging/automation/index.js";
import { FilterableDashboardWidget } from "../../types/layoutTypes.js";
import { QueryProcessingState } from "../useDashboardQueryProcessing.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { selectCrossFilteringItems } from "../../store/drill/drillSelectors.js";
import { usePrevious } from "@gooddata/sdk-ui";
import { useMemo } from "react";
import {
    selectEnableAutomationFilterContext,
    selectEnableDateFilterIdentifiers,
} from "../../../model/store/index.js";
import { generateDateFilterLocalIdentifier } from "@gooddata/sdk-backend-base";
/**
 * @alpha
 */
export interface IUseFiltersForWidgetScheduledExportProps {
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
 * Hook for getting filters for widget scheduled export.
 *
 * Note:
 * - The resulting filters are a combination of insight and dashboard filters, following these rules:
 *     - Cross-filtering filters are excluded as they are typically not desired in the scheduled export.
 *     - The widget's ignored filters configuration is honored (ignored filters are not overridden by dashboard filters and remain as is).
 *     - If the resulting filters include all-time date filter, it is excluded as it has no effect on the scheduled export execution.
 *
 * - If we are editing an existing scheduled export, this function will return its filters, as changing saved filters is currently not allowed.
 *
 * @alpha
 */
export function useFiltersForWidgetScheduledExport({
    scheduledExportToEdit,
    widget,
    insight,
}: IUseFiltersForWidgetScheduledExportProps): QueryProcessingState<IFilter[]> {
    const savedWidgetFilters = getAutomationVisualizationFilters(scheduledExportToEdit);
    const enableAutomationFilterContext = useDashboardSelector(selectEnableAutomationFilterContext);
    const enableDateFilterIdentifiers = useDashboardSelector(selectEnableDateFilterIdentifiers);

    const previousWidgetRef = usePrevious(widget?.ref);
    const widgetFiltersQuery = useWidgetFilters(widget, insight);

    /**
     * The useWidgetFilters hook has a limitation where it doesn't return a pending/running state when the widget changes or becomes unavailable.
     * Instead, it returns filters for the previously loaded widget.
     * This adjustment ensures we return a pending state when the widget is not yet loaded or has changed,
     * addressing the issue without modifying useWidgetFilters implementation 🚜.
     * This temporary workaround should be replaced by fixing useWidgetFilters in a future update.
     */
    const correctedWidgetFiltersQuery = useMemo(() => {
        if (!widget || !insight || previousWidgetRef !== widget?.ref) {
            return {
                result: undefined,
                status: "pending",
                error: undefined,
            } as QueryProcessingState<IFilter[]>;
        }

        return widgetFiltersQuery;
    }, [widgetFiltersQuery, previousWidgetRef, widget, insight]);

    const crossFilteringItems = useDashboardSelector(selectCrossFilteringItems);
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap((c) => c.filterLocalIdentifiers);

    const resolvedFiltersWithoutCrossFiltering = correctedWidgetFiltersQuery.result?.filter((f) => {
        const filterLocalId = filterLocalIdentifier(f);
        return filterLocalId ? !crossFilteringFilterLocalIdentifiers.includes(filterLocalId) : true;
    });
    const resolvedFiltersWithoutCrossFilteringAndAllTimeDateFilter = enableAutomationFilterContext
        ? [...(resolvedFiltersWithoutCrossFiltering ?? [])]
        : resolvedFiltersWithoutCrossFiltering?.filter((f) => !isAllTimeDateFilter(f));

    const commonDateFilter = widget?.dateDataSet
        ? newAllTimeFilter(
              widget.dateDataSet,
              enableDateFilterIdentifiers ? generateDateFilterLocalIdentifier(0) : undefined,
          )
        : undefined;
    const shouldAddCommonDateFilter =
        enableAutomationFilterContext &&
        !resolvedFiltersWithoutCrossFilteringAndAllTimeDateFilter?.some(isAllTimeDateFilter) &&
        commonDateFilter;
    const sanitizedFilters = shouldAddCommonDateFilter
        ? [commonDateFilter, ...(resolvedFiltersWithoutCrossFilteringAndAllTimeDateFilter ?? [])]
        : resolvedFiltersWithoutCrossFilteringAndAllTimeDateFilter;

    if (savedWidgetFilters) {
        return {
            result: savedWidgetFilters,
            error: undefined,
            status: "success",
        };
    } else if (sanitizedFilters && correctedWidgetFiltersQuery.status === "success") {
        return {
            result: sanitizedFilters,
            error: undefined,
            status: "success",
        };
    } else {
        return correctedWidgetFiltersQuery;
    }
}
