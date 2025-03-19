// (C) 2020-2024 GoodData Corporation
import last from "lodash/last.js";
import { IInsightDefinition, insightVisualizationUrl } from "@gooddata/sdk-model";
import { IVisualizationDescriptor } from "../interfaces/VisualizationDescriptor.js";
import { AreaChartDescriptor } from "./pluggableVisualizations/areaChart/AreaChartDescriptor.js";
import { BarChartDescriptor } from "./pluggableVisualizations/barChart/BarChartDescriptor.js";
import { BubbleChartDescriptor } from "./pluggableVisualizations/bubbleChart/BubbleChartDescriptor.js";
import { BulletChartDescriptor } from "./pluggableVisualizations/bulletChart/BulletChartDescriptor.js";
import { ColumnChartDescriptor } from "./pluggableVisualizations/columnChart/ColumnChartDescriptor.js";
import { ComboChartDescriptor } from "./pluggableVisualizations/comboChart/ComboChartDescriptor.js";
import { ComboChartDescriptorDeprecated } from "./pluggableVisualizations/comboChart/ComboChartDescriptorDeprecated.js";
import { DonutChartDescriptor } from "./pluggableVisualizations/donutChart/DonutChartDescriptor.js";
import { FunnelChartDescriptor } from "./pluggableVisualizations/funnelChart/FunnelChartDescriptor.js";
import { PyramidChartDescriptor } from "./pluggableVisualizations/pyramidChart/PyramidChartDescriptor.js";
import { HeadlineDescriptor } from "./pluggableVisualizations/headline/HeadlineDescriptor.js";
import { HeatmapDescriptor } from "./pluggableVisualizations/heatMap/HeatmapDescriptor.js";
import { LineChartDescriptor } from "./pluggableVisualizations/lineChart/LineChartDescriptor.js";
import { PieChartDescriptor } from "./pluggableVisualizations/pieChart/PieChartDescriptor.js";
import { PivotTableDescriptor } from "./pluggableVisualizations/pivotTable/PivotTableDescriptor.js";
import { ScatterPlotDescriptor } from "./pluggableVisualizations/scatterPlot/ScatterPlotDescriptor.js";
import { TreemapDescriptor } from "./pluggableVisualizations/treeMap/TreemapDescriptor.js";
import { XirrDescriptor } from "./pluggableVisualizations/xirr/XirrDescriptor.js";
import { GeoPushpinChartDescriptor } from "./pluggableVisualizations/geoChart/GeoPushpinChartDescriptor.js";
import { UnknownVisualizationDescriptor } from "./pluggableVisualizations/UnknownVisualizationDescriptor.js";
import { SankeyChartDescriptor } from "./pluggableVisualizations/sankeyChart/SankeyChartDescriptor.js";
import { DependencyWheelChartDescriptor } from "./pluggableVisualizations/dependencyWheelChart/DependencyWheelChartDescriptor.js";
import { WaterfallChartDescriptor } from "./pluggableVisualizations/waterfallChart/WaterfallChartDescriptor.js";
import { RepeaterDescriptor } from "./pluggableVisualizations/repeater/RepeaterDescriptor.js";

/**
 * Visualization catalog is able to resolve visualization class to factory function that will
 * create respective pluggable visualization.
 *
 * @alpha
 */
export interface IVisualizationCatalog {
    /**
     * Looks up pluggable visualization descriptor by vis class URI.
     *
     * @param uri - visualization URI (in format such as local:<type>)
     * @alpha
     */
    forUri(uri: string): IVisualizationDescriptor;

    /**
     * Looks up whether there is a pluggable visualization descriptor for a given vis class URI.
     *
     * @param uri - visualization URI (in format such as local:<type>)
     * @alpha
     */
    hasDescriptorForUri(uri: string): boolean;

    /**
     * Looks up pluggable visualization descriptor that provides all access to the visualization.
     *
     * @param insight - insight to render
     * @alpha
     */
    forInsight(insight: IInsightDefinition): IVisualizationDescriptor;

    /**
     * Looks up whether there is a pluggable visualization descriptor for the provided insight.
     *
     * @param insight - insight to query for
     * @alpha
     */
    hasDescriptorForInsight(insight: IInsightDefinition): boolean;
}

type TypeToClassMapping = {
    [type: string]: any;
};

/**
 * @internal
 */
export class CatalogViaTypeToClassMap implements IVisualizationCatalog {
    constructor(private readonly mapping: TypeToClassMapping) {}

    public forUri(uri: string): IVisualizationDescriptor {
        const VisType = this.findInMapping(uri);

        if (!VisType) {
            console.warn(
                `Unknown visualization class: ${uri}. The reason may be that the visualization type is incompatible with dashboard plugins. Try removing the plugins from this dashboard or use different visualization type.`,
            );
            return new UnknownVisualizationDescriptor(uri);
        }

        return new VisType();
    }

    public hasDescriptorForUri(uri: string): boolean {
        return !!this.findInMapping(uri);
    }

    public forInsight(insight: IInsightDefinition): IVisualizationDescriptor {
        /*
         * the URIs follow "local:visualizationType" format
         */
        const visClassUri = insightVisualizationUrl(insight);

        return this.forUri(visClassUri);
    }

    public hasDescriptorForInsight(insight: IInsightDefinition): boolean {
        const visClassUri = insightVisualizationUrl(insight);
        return this.hasDescriptorForUri(visClassUri);
    }

    private findInMapping(uri: string): any | undefined {
        const split = uri.split(":");
        const key = last(split) as keyof typeof DefaultVisualizations;
        return this.mapping[key];
    }
}

//
// Default static catalog implementation
//

/**
 * Compile-time pluggable visualization 'catalog'.
 */
const DefaultVisualizations = {
    bar: BarChartDescriptor,
    bullet: BulletChartDescriptor,
    column: ColumnChartDescriptor,
    line: LineChartDescriptor,
    area: AreaChartDescriptor,
    pie: PieChartDescriptor,
    donut: DonutChartDescriptor,
    table: PivotTableDescriptor,
    headline: HeadlineDescriptor,
    scatter: ScatterPlotDescriptor,
    bubble: BubbleChartDescriptor,
    heatmap: HeatmapDescriptor,
    combo: ComboChartDescriptorDeprecated, // old combo chart
    combo2: ComboChartDescriptor, // new combo chart
    treemap: TreemapDescriptor,
    funnel: FunnelChartDescriptor,
    pyramid: PyramidChartDescriptor,
    pushpin: GeoPushpinChartDescriptor,
    sankey: SankeyChartDescriptor,
    dependencywheel: DependencyWheelChartDescriptor,
    waterfall: WaterfallChartDescriptor,
    repeater: RepeaterDescriptor,
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
    xirr: XirrDescriptor,
});
