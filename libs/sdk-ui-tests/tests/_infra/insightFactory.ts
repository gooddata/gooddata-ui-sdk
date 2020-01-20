// (C) 2020 GoodData Corporation

import { IInsightDefinition, newInsightDefinition, VisualizationProperties } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui";
import { ChartInteractions } from "./backendWithCapturing";

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

    /*
     * Indeed, the properties content is stored in 'properties' entry in insight AND the content itself
     * is wrapper in another object under 'properties' entry.
     *
     * For more see: getSupportedProperties in propertiesHelper.ts or the code that creates insight from
     * bear visualization object.
     *
     * TODO: remove this double wrap
     */
    const properties: VisualizationProperties =
        chartConfig !== undefined ? { properties: { controls: chartConfig } } : {};
    const execution = interactions.triggeredExecution;
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
