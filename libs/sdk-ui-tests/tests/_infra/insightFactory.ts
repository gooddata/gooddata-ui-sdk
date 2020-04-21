// (C) 2020 GoodData Corporation

import { IInsightDefinition, newInsightDefinition, VisualizationProperties } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";
import { ChartInteractions } from "./backendWithCapturing";
import { chartConfigToVisProperties } from "./chartConfigToVisProps";

function visNameToUri(name: string): string {
    if (name === "PivotTable") {
        return "local:table";
    } else if (name === "ComboChart") {
        return "local:combo2";
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
    const chartConfig: IChartConfig | undefined = interactions.effectiveProps.config;

    const properties: VisualizationProperties = chartConfigToVisProperties(chartConfig);
    const execution = interactions.normalizationState?.original ?? interactions.triggeredExecution;
    const visClassUri = visNameToUri(name);

    return newInsightDefinition(visClassUri, b => {
        return b
            .title(`${name} - ${scenario}`)
            .buckets(execution?.buckets ?? [])
            .sorts(execution?.sortBy ?? [])
            .filters(execution?.filters ?? [])
            .properties(properties);
    });
}
