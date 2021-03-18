// (C) 2020-2021 GoodData Corporation
import last from "lodash/last";
import { IInsightDefinition, insightVisualizationUrl } from "@gooddata/sdk-model";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { IVisualizationDescriptor } from "../interfaces/VisualizationDescriptor";
import { AreaChartDescriptor } from "./pluggableVisualizations/areaChart/AreaChartDescriptor";
import { BarChartDescriptor } from "./pluggableVisualizations/barChart/BarChartDescriptor";
import { BubbleChartDescriptor } from "./pluggableVisualizations/bubbleChart/BubbleChartDescriptor";
import { BulletChartDescriptor } from "./pluggableVisualizations/bulletChart/BulletChartDescriptor";
import { ColumnChartDescriptor } from "./pluggableVisualizations/columnChart/ColumnChartDescriptor";
import { ComboChartDescriptor } from "./pluggableVisualizations/comboChart/ComboChartDescriptor";
import { ComboChartDescriptorDeprecated } from "./pluggableVisualizations/comboChart/ComboChartDescriptorDeprecated";
import { DonutChartDescriptor } from "./pluggableVisualizations/donutChart/DonutChartDescriptor";
import { FunnelChartDescriptor } from "./pluggableVisualizations/funnelChart/FunnelChartDescriptor";
import { HeadlineDescriptor } from "./pluggableVisualizations/headline/HeadlineDescriptor";
import { HeatmapDescriptor } from "./pluggableVisualizations/heatMap/HeatmapDescriptor";
import { LineChartDescriptor } from "./pluggableVisualizations/lineChart/LineChartDescriptor";
import { PieChartDescriptor } from "./pluggableVisualizations/pieChart/PieChartDescriptor";
import { PivotTableDescriptor } from "./pluggableVisualizations/pivotTable/PivotTableDescriptor";
import { ScatterPlotDescriptor } from "./pluggableVisualizations/scatterPlot/ScatterPlotDescriptor";
import { TreemapDescriptor } from "./pluggableVisualizations/treeMap/TreemapDescriptor";
import { XirrDescriptor } from "./pluggableVisualizations/xirr/XirrDescriptor";
import { GeoPushpinChartDescriptor } from "./pluggableVisualizations/geoChart/GeoPushpinChartDescriptor";

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
            throw new UnexpectedSdkError(`Unknown visualization class URI: ${uri}`);
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
    pushpin: GeoPushpinChartDescriptor,
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
