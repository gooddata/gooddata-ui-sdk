// (C) 2025 GoodData Corporation

import {
    FilterContextItem,
    IExecutionDefinition,
    IExportDefinitionVisualizationObjectRequestPayload,
    IFilter,
    IInsight,
    isFilter,
    isFilterContextItem,
    isWidget,
    mergeFilters,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/index.js";
import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";

export function prepareCsvRawExecutionDefinition(
    executionDefinition: IExecutionDefinition | undefined,
    csvRawRequest: IExportDefinitionVisualizationObjectRequestPayload,
    insight: IInsight | undefined,
    widget: ExtendedDashboardWidget | undefined,
    commonDateFilterId: string | undefined,
): IExecutionDefinition | undefined {
    const filters = csvRawRequest?.content?.filters;

    if (!executionDefinition || !filters?.length || !insight) {
        return executionDefinition;
    }

    const executionFilters = exportRequestFiltersToExecutionFilters(filters, widget);

    if (!executionFilters.length) {
        return executionDefinition;
    }

    const baseFilters = insight.insight?.filters ?? [];
    const mergedFilters = mergeFilters(baseFilters, executionFilters, commonDateFilterId);

    return {
        ...executionDefinition,
        filters: mergedFilters,
    };
}

function exportRequestFiltersToExecutionFilters(
    filters: (FilterContextItem | IFilter)[],
    widget: ExtendedDashboardWidget | undefined,
): IFilter[] {
    const executionFilters = filters.filter(isFilter);
    const filterContextItems = filters.filter(isFilterContextItem);

    if (!filterContextItems.length) {
        return executionFilters;
    }

    const filterableWidget = isWidget(widget) ? widget : undefined;
    const dashboardFilters = filterContextItemsToDashboardFiltersByWidget(
        filterContextItems,
        filterableWidget,
    );

    return [...executionFilters, ...dashboardFilters];
}
