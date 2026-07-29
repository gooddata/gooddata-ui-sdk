// (C) 2026 GoodData Corporation

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

/**
 * Keyed by the schema's `Visualisation["type"]` union so a new chart type fails the build until mapped;
 * both conversion directions read it, so they cannot drift.
 * @internal
 */
export const yamlVisTypeToVisualizationUrl: Record<Visualisation["type"], string> = {
    table: "local:table",
    bar_chart: "local:bar",
    column_chart: "local:column",
    line_chart: "local:line",
    area_chart: "local:area",
    scatter_chart: "local:scatter",
    bubble_chart: "local:bubble",
    pie_chart: "local:pie",
    donut_chart: "local:donut",
    treemap_chart: "local:treemap",
    pyramid_chart: "local:pyramid",
    funnel_chart: "local:funnel",
    heatmap_chart: "local:heatmap",
    bullet_chart: "local:bullet",
    waterfall_chart: "local:waterfall",
    dependency_wheel_chart: "local:dependencywheel",
    sankey_chart: "local:sankey",
    headline_chart: "local:headline",
    combo_chart: "local:combo2",
    geo_chart: "local:pushpin",
    geo_area_chart: "local:choropleth",
    repeater_chart: "local:repeater",
    radar_chart: "local:radar",
};

export const visualizationUrlToYamlVisType: ReadonlyMap<string, Visualisation["type"]> = new Map(
    (Object.entries(yamlVisTypeToVisualizationUrl) as [Visualisation["type"], string][]).map(
        ([yamlType, url]) => [url, yamlType],
    ),
);
