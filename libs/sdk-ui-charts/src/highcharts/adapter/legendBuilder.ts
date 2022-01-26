// (C) 2007-2021 GoodData Corporation
import pick from "lodash/pick";
import set from "lodash/set";
import {
    isAreaChart,
    isBubbleChart,
    isComboChart,
    isHeatmap,
    isLineChart,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
} from "../chartTypes/_util/common";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { isStackedChart, getComboChartSeries, createDualAxesSeriesMapper } from "./legendHelpers";
import { supportedDualAxesChartTypes } from "../chartTypes/_chartOptions/chartCapabilities";
import { IChartOptions } from "../typings/unsafe";
import {
    LegendOptionsItemType,
    ILegendOptions,
    DEFAULT_LEGEND_CONFIG,
    ItemBorderRadiusPredicate,
} from "@gooddata/sdk-ui-vis-commons";

function isHeatmapWithMultipleValues(chartOptions: IChartOptions) {
    const { type } = chartOptions;
    const dataClasses = chartOptions?.colorAxis?.dataClasses ?? [];

    return isHeatmap(type) && dataClasses.length > 1;
}

export function shouldLegendBeEnabled(chartOptions: IChartOptions): boolean {
    const seriesLength = chartOptions?.data?.series?.length;
    const { type, hasStackByAttribute, hasViewByAttribute } = chartOptions;

    const hasMoreThanOneSeries = seriesLength > 1;
    const isLineChartStacked = isLineChart(type) && hasStackByAttribute;
    const isStacked = isStackedChart(chartOptions);
    const sliceTypes = [VisualizationTypes.PIE, VisualizationTypes.DONUT];
    const isSliceChartWithViewByAttributeOrMultipleMeasures =
        isOneOfTypes(type, sliceTypes) && (hasViewByAttribute || chartOptions.data.series[0].data.length > 1);
    const isBubbleWithViewByAttribute = isBubbleChart(type) && hasViewByAttribute;
    const isScatterPlotWithAttribute = isScatterPlot(type) && chartOptions.data.series[0].name;
    const isTreemapWithViewByAttribute = isTreemap(type) && hasViewByAttribute;
    const isTreemapWithManyCategories = isTreemap(type) && chartOptions.data.categories.length > 1;

    return (
        hasMoreThanOneSeries ||
        isSliceChartWithViewByAttributeOrMultipleMeasures ||
        isStacked ||
        isLineChartStacked ||
        isScatterPlotWithAttribute ||
        isTreemapWithViewByAttribute ||
        isBubbleWithViewByAttribute ||
        isTreemapWithManyCategories ||
        isHeatmapWithMultipleValues(chartOptions)
    );
}

export function getLegendItems(chartOptions: IChartOptions): LegendOptionsItemType[] {
    const { type } = chartOptions;
    const firstSeriesDataTypes = [
        VisualizationTypes.PIE,
        VisualizationTypes.DONUT,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.FUNNEL,
        VisualizationTypes.SCATTER,
    ];

    if (isHeatmap(type)) {
        const dataClasses = chartOptions?.colorAxis?.dataClasses ?? [];
        return dataClasses.map((dataClass, index) => {
            const { from, to } = dataClass;
            const color: string = dataClass.color as string; // wa are not using Gradient

            const range = {
                from,
                to,
            };

            return {
                range,
                color,
                legendIndex: index,
            };
        });
    }

    const legendDataSource = isOneOfTypes(type, firstSeriesDataTypes)
        ? chartOptions.data.series[0].data
        : chartOptions.data.series;

    let pickedProps = ["name", "color", "legendIndex"];
    if (isOneOfTypes(type, supportedDualAxesChartTypes)) {
        // 'yAxis' helps to distinguish primary and secondary axes
        pickedProps = [...pickedProps, "yAxis"];
    }

    if (isComboChart(type)) {
        pickedProps = [...pickedProps, "type"];
    }

    return legendDataSource
        .filter((legendDataSourceItem: any) => legendDataSourceItem.showInLegend !== false)
        .map((legendDataSourceItem: any) => pick(legendDataSourceItem, pickedProps));
}

export default function buildLegendOptions(
    legendConfig: any = {},
    chartOptions: IChartOptions,
): ILegendOptions {
    const defaultLegendConfigByType = {};
    const rightLegendCharts = [
        VisualizationTypes.SCATTER,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.BUBBLE,
        VisualizationTypes.HEATMAP,
    ];
    const defaultTopLegendCharts = [
        VisualizationTypes.COLUMN,
        VisualizationTypes.BAR,
        VisualizationTypes.BULLET,
        VisualizationTypes.LINE,
        VisualizationTypes.AREA,
        VisualizationTypes.PIE,
        VisualizationTypes.DONUT,
    ];

    if (legendConfig.position === "auto" || !legendConfig.position) {
        if (isOneOfTypes(chartOptions.type, rightLegendCharts)) {
            set(defaultLegendConfigByType, "position", "right");
        }

        if (isOneOfTypes(chartOptions.type, defaultTopLegendCharts) && !chartOptions.hasStackByAttribute) {
            set(defaultLegendConfigByType, "position", "top");
        }
    }

    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig,
        ...defaultLegendConfigByType, // TODO: swipe these two lines once default legend logic is moved to the sdk
    };

    const isLegendEnabled = shouldLegendBeEnabled(chartOptions);

    return {
        ...baseConfig,
        enabled: baseConfig.enabled && isLegendEnabled,
        toggleEnabled: isLegendEnabled,
        format: chartOptions?.title?.format ?? "",
        items: getLegendItems(chartOptions),
        enableBorderRadius: createItemBorderRadiusPredicate(chartOptions.type),
        seriesMapper: createSeriesMapper(chartOptions.type),
    };
}

/**
 * Given chart type, this creates predicate to turn legend item border radius on or off. The border
 * radius is set to make legend item indicators appear as circles instead of squares.
 *
 * The predicate is crafted so that line and area charts have indicators as circles. This also stands for
 * combo chart - line or area items within combo must use circles.
 *
 * @param chartType - top-level chart type (combo chart will have legend items of different types)
 */
function createItemBorderRadiusPredicate(chartType: string): boolean | ItemBorderRadiusPredicate {
    if (isLineChart(chartType) || isAreaChart(chartType)) {
        /*
         * It is clear that all items are of same type and should have indicators as circles.
         */
        return true;
    } else if (isComboChart(chartType)) {
        /*
         * For combo chart, determine item-by-item
         */
        return (item: any) => {
            return isLineChart(item.type) || isAreaChart(item.type);
        };
    }

    return false;
}

/**
 * Given chart type, this function creates a series mapper which will alter previously created legend
 * items. This code was previously insight the legend implementation. It is extracted here to make legends
 * visualization agnostic.
 *
 * The big question is - why is this mapper even needed, why not creating the legend items correctly the first time?
 * It is likely that the code was glued-in while implementing combo and dual axes charts. Perhaps better way is to
 * refactor the legend builders (which can be chart-specific) to create the legend items correctly.
 */
function createSeriesMapper(chartType: string) {
    if (isComboChart(chartType)) {
        return getComboChartSeries;
    }

    return createDualAxesSeriesMapper(chartType);
}
