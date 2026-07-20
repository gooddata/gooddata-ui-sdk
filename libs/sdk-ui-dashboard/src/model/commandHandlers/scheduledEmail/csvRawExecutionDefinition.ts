// (C) 2025-2026 GoodData Corporation

import {
    type FilterContextItem,
    type IExecutionDefinition,
    type IExportDefinitionVisualizationObjectRequestPayload,
    type IFilter,
    type IInsight,
    type IInsightParameterValue,
    isFilter,
    isFilterContextItem,
    isWidget,
    mergeFilters,
    objRefToString,
} from "@gooddata/sdk-model";

import { exportParametersToValues } from "../../../_staging/automation/index.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters/filterConverters.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";

export function prepareCsvRawExecutionDefinition({
    executionDefinition,
    csvRawRequest,
    insight,
    insightParameterValues,
    enableStringParameters,
    widget,
    commonDateFilterId,
}: {
    executionDefinition: IExecutionDefinition | undefined;
    csvRawRequest: IExportDefinitionVisualizationObjectRequestPayload;
    insight: IInsight | undefined;
    insightParameterValues: IInsightParameterValue[];
    enableStringParameters: boolean;
    widget: ExtendedDashboardWidget | undefined;
    commonDateFilterId: string | undefined;
}): IExecutionDefinition | undefined {
    if (!executionDefinition) {
        return executionDefinition;
    }

    const withFilters = applyExportFilters(
        executionDefinition,
        csvRawRequest,
        insight,
        widget,
        commonDateFilterId,
    );
    return applyExportParameters(withFilters, csvRawRequest, insightParameterValues, enableStringParameters);
}

function applyExportFilters(
    executionDefinition: IExecutionDefinition,
    csvRawRequest: IExportDefinitionVisualizationObjectRequestPayload,
    insight: IInsight | undefined,
    widget: ExtendedDashboardWidget | undefined,
    commonDateFilterId: string | undefined,
): IExecutionDefinition {
    const filters = csvRawRequest?.content?.filters;

    if (!filters?.length || !insight) {
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

// Dialog overrides (`parametersByTab`) on top of the caller-resolved insight base. The base comes
// from a selector, not the live execution, whose no-data fallback (`newDefForInsight`) has no params.
function applyExportParameters(
    executionDefinition: IExecutionDefinition,
    csvRawRequest: IExportDefinitionVisualizationObjectRequestPayload,
    insightParameterValues: IInsightParameterValue[],
    enableStringParameters: boolean,
): IExecutionDefinition {
    const stored = Object.values(csvRawRequest?.content?.parametersByTab ?? {}).flat();
    const parameterValues = mergeParameterValues(
        insightParameterValues,
        exportParametersToValues(stored, enableStringParameters),
    );

    if (parameterValues.length === 0) {
        return executionDefinition;
    }

    return {
        ...executionDefinition,
        executionConfig: {
            ...executionDefinition.executionConfig,
            parameterValues,
        },
    };
}

// Overlay overrides onto base by ref; override wins, base order preserved (`Map.set` on an existing
// key keeps its position).
function mergeParameterValues(
    base: IInsightParameterValue[],
    overrides: IInsightParameterValue[],
): IInsightParameterValue[] {
    const byRef = new Map(base.map((parameter) => [objRefToString(parameter.ref), parameter]));
    for (const override of overrides) {
        byRef.set(objRefToString(override.ref), override);
    }
    return [...byRef.values()];
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
