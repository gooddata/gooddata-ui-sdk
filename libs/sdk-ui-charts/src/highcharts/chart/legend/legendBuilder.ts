// (C) 2007-2019 GoodData Corporation
import pick = require("lodash/pick");
import set = require("lodash/set");
import get = require("lodash/get");
import Highcharts from "../highcharts/highchartsEntryPoint";
import {
    isBubbleChart,
    isComboChart,
    isHeatmap,
    isLineChart,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
} from "../../utils/common";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { ILegendOptions, LegendOptionsItemType, DEFAULT_LEGEND_CONFIG } from "../../typings/legend";
import { supportedDualAxesChartTypes } from "../chartOptionsBuilder";
import { isStackedChart } from "./helpers";

function isHeatmapWithMultipleValues(chartOptions: any) {
    const { type } = chartOptions;
    const dataClasses: Highcharts.ColorAxisDataClassesOptions[] = get(
        chartOptions,
        "colorAxis.dataClasses",
        [],
    );

    return isHeatmap(type) && dataClasses.length > 1;
}

export function shouldLegendBeEnabled(chartOptions: any) {
    const seriesLength = get(chartOptions, "data.series.length");
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

export function getLegendItems(chartOptions: any): LegendOptionsItemType[] {
    const { type } = chartOptions;
    const firstSeriesDataTypes = [
        VisualizationTypes.PIE,
        VisualizationTypes.DONUT,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.FUNNEL,
        VisualizationTypes.SCATTER,
    ];

    if (isHeatmap(type)) {
        const dataClasses: Highcharts.ColorAxisDataClassesOptions[] = get(
            chartOptions,
            "colorAxis.dataClasses",
            [],
        );
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

export default function getLegend(legendConfig: any = {}, chartOptions: any): ILegendOptions {
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
        format: get(chartOptions, "title.format", ""),
        items: getLegendItems(chartOptions),
    };
}
