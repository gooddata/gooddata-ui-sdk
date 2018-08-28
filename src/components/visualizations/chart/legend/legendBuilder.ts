// (C) 2007-2018 GoodData Corporation
import pick = require('lodash/pick');
import set = require('lodash/set');
import get = require('lodash/get');
import * as Highcharts from 'highcharts';
import {
    isAreaChart,
    isBubbleChart,
    isHeatmap,
    isLineChart,
    isOneOfTypes,
    isScatterPlot,
    isTreemap
} from '../../utils/common';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';
import { ILegendOptions, LegendOptionsItemType, DEFAULT_LEGEND_CONFIG } from '../../typings/legend';

function isHeatmapWithMultipleValues(chartOptions: any) {
    const { type } = chartOptions;
    const dataClasses: Highcharts.ColorAxisDataClass[] = get(chartOptions, 'colorAxis.dataClasses', []);

    return isHeatmap(type) && dataClasses.length > 1;
}

export function shouldLegendBeEnabled(chartOptions: any) {
    const seriesLength = get(chartOptions, 'data.series.length');
    const { type, stacking, hasStackByAttribute, hasViewByAttribute } = chartOptions;

    const hasMoreThanOneSeries = seriesLength > 1;
    const isAreaChartWithOneSerie = isAreaChart(type) && !hasMoreThanOneSeries && !hasStackByAttribute;
    const isLineChartStacked = isLineChart(type) && hasStackByAttribute;
    const isStacked = !isAreaChartWithOneSerie && !isTreemap(type) && Boolean(stacking);
    const sliceTypes = [VisualizationTypes.PIE, VisualizationTypes.DONUT];
    const isSliceChartWithViewByAttributeOrMultipleMeasures =
        isOneOfTypes(type, sliceTypes) && (hasViewByAttribute || chartOptions.data.series[0].data.length > 1);
    const isBubbleWithViewByAttribute = isBubbleChart(type) && hasViewByAttribute;
    const isScatterPlotWithAttribute = isScatterPlot(type) && chartOptions.data.series[0].name;
    const isTreemapWithViewByAttribute = isTreemap(type) && hasViewByAttribute;
    const isTreemapWithManyCategories = isTreemap(type) && chartOptions.data.categories.length > 1;

    return hasMoreThanOneSeries
        || isSliceChartWithViewByAttributeOrMultipleMeasures
        || isStacked
        || isLineChartStacked
        || isScatterPlotWithAttribute
        || isTreemapWithViewByAttribute
        || isBubbleWithViewByAttribute
        || isTreemapWithManyCategories
        || isHeatmapWithMultipleValues(chartOptions);
}

export function getLegendItems(chartOptions: any): LegendOptionsItemType[] {
    const { type } = chartOptions;
    const firstSeriesDataTypes = [
        VisualizationTypes.PIE,
        VisualizationTypes.DONUT,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.FUNNEL,
        VisualizationTypes.SCATTER
    ];

    if (isHeatmap(type)) {
        const dataClasses: Highcharts.ColorAxisDataClass[] = get(chartOptions, 'colorAxis.dataClasses', []);
        return dataClasses.map((dataClass, index) => {
            const { from, to } = dataClass;
            const color: string = dataClass.color as string; // wa are not using Gradient

            const range = {
                from,
                to
            };

            return {
                range,
                color,
                legendIndex: index
            };
        });
    }

    const legendDataSource = isOneOfTypes(type, firstSeriesDataTypes)
        ? chartOptions.data.series[0].data
        : chartOptions.data.series;

    return legendDataSource
        .filter((legendDataSourceItem: any) =>
            legendDataSourceItem.showInLegend !== false)
        .map((legendDataSourceItem: any) =>
            pick(legendDataSourceItem, ['name', 'color', 'legendIndex']));
}

export default function getLegend(legendConfig: any = {}, chartOptions: any): ILegendOptions {
    const defaultLegendConfigByType = {};
    const rightLegendCharts =
        [VisualizationTypes.SCATTER, VisualizationTypes.TREEMAP, VisualizationTypes.BUBBLE, VisualizationTypes.HEATMAP];
    const defaultTopLegendCharts =
        [VisualizationTypes.COLUMN, VisualizationTypes.BAR, VisualizationTypes.LINE,
        VisualizationTypes.AREA, VisualizationTypes.PIE, VisualizationTypes.DONUT];

    if (legendConfig.position === 'auto' || !legendConfig.position) {
        if (isOneOfTypes(chartOptions.type, rightLegendCharts)) {
            set(defaultLegendConfigByType, 'position', 'right');
        }

        if (isOneOfTypes(chartOptions.type, defaultTopLegendCharts) && !chartOptions.hasStackByAttribute) {
            set(defaultLegendConfigByType, 'position', 'top');
        }
    }

    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig,
        ...defaultLegendConfigByType // TODO: swipe these two lines once default legend logic is moved to the sdk
    };

    const isLegendEnabled = shouldLegendBeEnabled(chartOptions);

    return {
        ...baseConfig,
        enabled: baseConfig.enabled && isLegendEnabled,
        toggleEnabled: isLegendEnabled,
        format: get(chartOptions, 'title.format', ''),
        items: getLegendItems(chartOptions)
    };
}
