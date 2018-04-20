// (C) 2007-2018 GoodData Corporation
import pick = require('lodash/pick');
import set = require('lodash/set');
import { RIGHT } from './PositionTypes';
import {
    isAreaChart,
    isPieOrDonutChart,
    isScatterPlot,
    isTreemap,
    isFunnelChart
} from '../../utils/common';

export const DEFAULT_LEGEND_CONFIG = {
    enabled: true,
    position: RIGHT
};

export function shouldLegendBeEnabled(chartOptions: any) {
    const seriesLength = chartOptions.data.series.length;
    const { type, stacking, hasStackByAttribute } = chartOptions;
    // More than one measure or stackedBy more than one category
    const hasMoreThanOneSeries = seriesLength > 1;
    const isAreaChartWithOneSerie = isAreaChart(type) && !hasMoreThanOneSeries && !hasStackByAttribute;
    const isStacked = !isAreaChartWithOneSerie && Boolean(stacking);

    const isPieOrTreemapWithMoreThanOneCategory = ((isPieOrDonutChart(type) || isTreemap(type)) &&
        chartOptions.data.series[0].data.length > 1);

    const isScatterPlotWithAttribute = isScatterPlot(type) && chartOptions.data.series[0].name;

    return hasMoreThanOneSeries || isPieOrTreemapWithMoreThanOneCategory || isStacked || isScatterPlotWithAttribute;
}

export function getLegendItems(chartOptions: any) {
    const { type } = chartOptions;
    const legendDataSource = (isPieOrDonutChart(type) || isTreemap(type) || isFunnelChart(type))
        ? chartOptions.data.series[0].data
        : chartOptions.data.series;

    return legendDataSource.map((legendDataSourceItem: any) =>
        pick(legendDataSourceItem, ['name', 'color', 'legendIndex']));
}

export default function getLegend(legendConfig: any = {}, chartOptions: any) {
    if (isScatterPlot(chartOptions.type) || isTreemap(chartOptions.type)) { // TODO: refactor
        set(legendConfig, 'position', 'right');
    }

    if (isFunnelChart(chartOptions.type)) { // TODO: refactor
        set(legendConfig, 'enabled', 'false');
    }

    const baseConfig = {
        ...DEFAULT_LEGEND_CONFIG,
        ...legendConfig
    };

    return {
        ...baseConfig,
        enabled: baseConfig.enabled && shouldLegendBeEnabled(chartOptions),
        items: getLegendItems(chartOptions)
    };
}
