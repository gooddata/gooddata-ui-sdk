// (C) 2020 GoodData Corporation

import { IInsightDefinition, newInsightDefinition, VisualizationProperties } from "@gooddata/sdk-model";
import { ChartInteractions } from "./backendWithCapturing";
import { chartConfigToVisProperties, geoChartConfigToVisProperties } from "./chartConfigToVisProps";
import { geoExecutionToInsightBuckets } from "./executionToInsightBuckets";

function visNameToUri(name: string): string {
    if (name === "PivotTable") {
        return "local:table";
    } else if (name === "ComboChart") {
        return "local:combo2";
    } else if (name === "GeoPushpinChart") {
        return "local:pushpin";
    }

    const simpleName = name
        .replace("Chart", "")
        .replace("Plot", "")
        .toLowerCase();

    return `local:${simpleName}`;
}

export function createInsightDefinitionForChart(
    name: string,
    scenario: string,
    interactions: ChartInteractions,
): IInsightDefinition {
    const chartConfig: any = interactions.effectiveProps.config;
    const visClassUri = visNameToUri(name);
    const execution = interactions.normalizationState?.original ?? interactions.triggeredExecution;

    /*
     * This code is here because of flaws in design. If you find yourself in need to add another IF here to support
     * your fancy new feature, then your design is also flawed.
     */
    const properties: VisualizationProperties =
        visClassUri === "local:pushpin"
            ? geoChartConfigToVisProperties(chartConfig)
            : chartConfigToVisProperties(chartConfig);
    const insightBuckets =
        visClassUri === "local:pushpin" ? geoExecutionToInsightBuckets(execution) : execution?.buckets ?? [];

    return newInsightDefinition(visClassUri, b => {
        return b
            .title(`${name} - ${scenario}`)
            .buckets(insightBuckets)
            .sorts(execution?.sortBy ?? [])
            .filters(execution?.filters ?? [])
            .properties(properties);
    });
}
