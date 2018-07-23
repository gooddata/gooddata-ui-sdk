// (C) 2007-2018 GoodData Corporation
import pick = require('lodash/pick');
import set = require('lodash/set');
import get = require('lodash/get');
import { RIGHT } from './PositionTypes';
import {
    isAreaChart,
    isScatterPlot,
    isOneOfTypes,
    isBubbleChart,
    isHeatMap
} from '../../utils/common';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';

export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: RIGHT
};

export function shouldLegendBeEnabled(chartOptions: any) {
    const seriesLength = get(chartOptions, 'data.series.length');
    const { type, stacking, hasStackByAttribute } = chartOptions;
    // More than one measure or stackedBy more than one category
    const hasMoreThanOneSeries = seriesLength > 1;
    const isAreaChartWithOneSerie = isAreaChart(type) && !hasMoreThanOneSeries && !hasStackByAttribute;
    const isStacked = !isAreaChartWithOneSerie && Boolean(stacking);

    const sliceTypes = [VisualizationTypes.PIE, VisualizationTypes.DONUT, VisualizationTypes.TREEMAP];
    const isSliceChartWithMoreThanOneCategory = isOneOfTypes(type, sliceTypes) &&
        chartOptions.data.series[0].data.length > 1;

    const isScatterPlotWithAttribute = isScatterPlot(type) && chartOptions.data.series[0].name;

    return hasMoreThanOneSeries
        || isSliceChartWithMoreThanOneCategory
        || isStacked
        || isScatterPlotWithAttribute
        || isHeatMap(type);
}

export function getLegendItems(chartOptions: any) {
    const { type } = chartOptions;
    const firstSeriesDataTypes = [
        VisualizationTypes.PIE,
        VisualizationTypes.DONUT,
        VisualizationTypes.TREEMAP,
        VisualizationTypes.FUNNEL,
        VisualizationTypes.SCATTER
    ];

    if (isHeatMap(type)) {
        const dataClasses: Highcharts.ColorAxisDataClass[] = get(chartOptions, 'colorAxis.dataClasses', []);
        return dataClasses.map((dataClass, index) => {
            const { from, to, color } = dataClass;
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

export default function getLegend(legendConfig: any = {}, chartOptions: any) {
    const defaultLegendConfigByType = {};
    const rightLegendCharts = [VisualizationTypes.SCATTER, VisualizationTypes.TREEMAP, VisualizationTypes.BUBBLE];

    if (isOneOfTypes(chartOptions.type, rightLegendCharts)) {
        set(defaultLegendConfigByType, 'position', 'right');

        // TODO: Remove after bubble will have own legend configuration
        if (isBubbleChart(chartOptions.type)) {
            set(defaultLegendConfigByType, 'enabled', true);
        }
    } else if (isHeatMap(chartOptions.type)) {
        set(legendConfig, 'position', 'top');
    }

    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig,
        ...defaultLegendConfigByType // TODO: swipe these two lines once default legend logic is moved to the sdk
    };

    return {
        ...baseConfig,
        enabled: baseConfig.enabled && shouldLegendBeEnabled(chartOptions),
        format: get(chartOptions, 'title.format', ''),
        items: getLegendItems(chartOptions)
    };
}
