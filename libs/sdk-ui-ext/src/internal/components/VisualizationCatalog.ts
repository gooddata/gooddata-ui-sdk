// (C) 2020 GoodData Corporation
import last = require("lodash/last");
import { IInsightDefinition, insightVisualizationUrl } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { IVisConstruct, IVisualization } from "../interfaces/Visualization";
import { PluggableAreaChart } from "./pluggableVisualizations/areaChart/PluggableAreaChart";
import { PluggableBarChart } from "./pluggableVisualizations/barChart/PluggableBarChart";
import { PluggableBubbleChart } from "./pluggableVisualizations/bubbleChart/PluggableBubbleChart";
import { PluggableBulletChart } from "./pluggableVisualizations/bulletChart/PluggableBulletChart";
import { PluggableColumnChart } from "./pluggableVisualizations/columnChart/PluggableColumnChart";
import { PluggableComboChart } from "./pluggableVisualizations/comboChart/PluggableComboChart";
import { PluggableComboChartDeprecated } from "./pluggableVisualizations/comboChart/PluggableComboChartDeprecated";
import { PluggableDonutChart } from "./pluggableVisualizations/donutChart/PluggableDonutChart";
import { PluggableFunnelChart } from "./pluggableVisualizations/funnelChart/PluggableFunnelChart";
import { PluggableHeadline } from "./pluggableVisualizations/headline/PluggableHeadline";
import { PluggableHeatmap } from "./pluggableVisualizations/heatMap/PluggableHeatmap";
import { PluggableLineChart } from "./pluggableVisualizations/lineChart/PluggableLineChart";
import { PluggablePieChart } from "./pluggableVisualizations/pieChart/PluggablePieChart";
import { PluggablePivotTable } from "./pluggableVisualizations/pivotTable/PluggablePivotTable";
import { PluggableScatterPlot } from "./pluggableVisualizations/scatterPlot/PluggableScatterPlot";
import { PluggableTreemap } from "./pluggableVisualizations/treeMap/PluggableTreemap";
import { PluggableXirr } from "./pluggableVisualizations/xirr/PluggableXirr";
import { PluggableGeoPushpinChart } from "./pluggableVisualizations/geoChart/PluggableGeoPushpinChart";

/**
 * Factories that create a new instance of pluggable visualization.
 *
 * @alpha
 */
export type PluggableVisualizationFactory = (params: IVisConstruct) => IVisualization;

/**
 * Visualization catalog is able to resolve visualization class to factory function that will
 * create respective pluggable visualization.
 *
 * @alpha
 */
export interface IVisualizationCatalog {
    /**
     * Looks up pluggable visualization factory by vis class URI.
     *
     * @param uri - visualization URI (in format such as local:<type>)
     * @alpha
     */
    forUri(uri: string): PluggableVisualizationFactory;

    /**
     * Looks up pluggable visualization implementation that should render the provided insight.
     *
     * @param insight - insight to render
     * @alpha
     */
    forInsight(insight: IInsightDefinition): PluggableVisualizationFactory;
}

type TypeToClassMapping = {
    [type: string]: any;
};

/**
 * @internal
 */
export class CatalogViaTypeToClassMap implements IVisualizationCatalog {
    constructor(private readonly mapping: TypeToClassMapping) {}

    public forUri(uri: string): PluggableVisualizationFactory {
        const split = uri.split(":");
        const key = last(split) as keyof typeof DefaultVisualizations;
        const VisType = this.mapping[key];

        if (!VisType) {
            throw new GoodDataSdkError(`Unknown visualization class URI: ${uri}`);
        }

        return params => new VisType(params);
    }

    public forInsight(insight: IInsightDefinition): PluggableVisualizationFactory {
        /*
         * the URIs follow "local:visualizationType" format
         */
        const visClassUri = insightVisualizationUrl(insight);

        return this.forUri(visClassUri);
    }
}

//
// Default static catalog implementation
//

/**
 * Compile-time pluggable visualization 'catalog'.
 */
const DefaultVisualizations = {
    bar: PluggableBarChart,
    bullet: PluggableBulletChart,
    column: PluggableColumnChart,
    line: PluggableLineChart,
    area: PluggableAreaChart,
    pie: PluggablePieChart,
    donut: PluggableDonutChart,
    table: PluggablePivotTable,
    headline: PluggableHeadline,
    scatter: PluggableScatterPlot,
    bubble: PluggableBubbleChart,
    heatmap: PluggableHeatmap,
    combo: PluggableComboChartDeprecated, // old combo chart
    combo2: PluggableComboChart, // new combo chart
    treemap: PluggableTreemap,
    funnel: PluggableFunnelChart,
    pushpin: PluggableGeoPushpinChart,
};

/**
 * Default pluggable visualization catalog. This is implemented using static lookup table between vis type
 * and the actual plug vis implementation.
 *
 * @alpha
 */
export const DefaultVisualizationCatalog: IVisualizationCatalog = new CatalogViaTypeToClassMap(
    DefaultVisualizations,
);

/**
 * Pluggable visualization catalog containing all available visualizations.
 *
 * @alpha
 */
export const FullVisualizationCatalog: IVisualizationCatalog = new CatalogViaTypeToClassMap({
    ...DefaultVisualizations,
    xirr: PluggableXirr,
});
