// (C) 2020 GoodData Corporation

import { IInsightDefinition, newInsightDefinition, VisualizationProperties } from "@gooddata/sdk-model";
import { ChartInteractions } from "./backendWithCapturing.js";
import { chartConfigToVisProperties, geoChartConfigToVisProperties } from "./chartConfigToVisProps.js";
import { geoExecutionToInsightBuckets } from "./executionToInsightBuckets.js";
import { pivotConfigToVisProperties } from "./pivotConfigToVisProps.js";

function visNameToUri(name: string): string {
    if (name === "PivotTable") {
        return "local:table";
    } else if (name === "ComboChart") {
        return "local:combo2";
    } else if (name === "GeoPushpinChart") {
        return "local:pushpin";
    }

    const simpleName = name.replace("Chart", "").replace("Plot", "").toLowerCase();

    return `local:${simpleName}`;
}

/*
 * This code is here because of flaws in design. If you find yourself in need to add another IF here to support
 * your fancy new feature, then your design is also flawed.
 *
 * It would be best, if the properties worked 'simply' as a storage for the config. that the config can be
 * stored in there as-is (unless of course it has some functions or such, which we would strip or persist
 * in declarative form).
 */
function createVisProperties(visClass: string, config: any) {
    if (visClass === "local:pushpin") {
        return geoChartConfigToVisProperties(config);
    } else if (visClass === "local:table") {
        return pivotConfigToVisProperties(config);
    } else {
        return chartConfigToVisProperties(config);
    }
}

export function createInsightDefinitionForChart(
    name: string,
    scenario: string,
    interactions: ChartInteractions,
): IInsightDefinition {
    const chartConfig: any = interactions.effectiveProps.config;
    const visClassUri = visNameToUri(name);
    const execution = interactions.normalizationState?.original ?? interactions.triggeredExecution;

    const properties: VisualizationProperties = createVisProperties(visClassUri, chartConfig);

    const insightBuckets =
        visClassUri === "local:pushpin" ? geoExecutionToInsightBuckets(execution) : execution?.buckets ?? [];

    return newInsightDefinition(visClassUri, (b) => {
        return b
            .title(`${name} - ${scenario}`)
            .buckets(insightBuckets)
            .sorts(execution?.sortBy ?? [])
            .filters(execution?.filters ?? [])
            .properties(properties);
    });
}
