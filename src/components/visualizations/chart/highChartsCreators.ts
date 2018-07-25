// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import merge = require('lodash/merge');
import * as invariant from 'invariant';
import {
    getCommonConfiguration
} from './highcharts/commonConfiguration';

import {
    stringifyChartTypes
} from '../utils/common';

import { IChartLimits } from './Chart';

import { getLineConfiguration } from './highcharts/lineConfiguration';
import { getBarConfiguration } from './highcharts/barConfiguration';
import { getColumnConfiguration } from './highcharts/columnConfiguration';
import { getCustomizedConfiguration } from './highcharts/customConfiguration';
import { getPieConfiguration } from './highcharts/pieConfiguration';
import { getDonutConfiguration } from './highcharts/donutConfiguration';
import { getAreaConfiguration } from './highcharts/areaConfiguration';
import { getScatterConfiguration } from './highcharts/scatterConfiguration';
import { getComboConfiguration } from './highcharts/comboConfiguration';
import { getTreemapConfiguration } from './highcharts/treemapConfiguration';
import { getFunnelConfiguration } from './highcharts/funnelConfiguration';
import { getHeatMapConfiguration } from './highcharts/heatMapConfiguration';
import { getBubbleConfiguration } from './highcharts/bubbleConfiguration';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

const chartConfigurationMap = {
    [VisualizationTypes.LINE]: getLineConfiguration,
    [VisualizationTypes.BAR]: getBarConfiguration,
    [VisualizationTypes.COLUMN]: getColumnConfiguration,
    [VisualizationTypes.PIE]: getPieConfiguration,
    [VisualizationTypes.AREA]: getAreaConfiguration,
    [VisualizationTypes.DUAL]: getLineConfiguration, // dual chart is line/line chart
    [VisualizationTypes.SCATTER]: getScatterConfiguration,
    [VisualizationTypes.COMBO]: getComboConfiguration,
    [VisualizationTypes.TREEMAP]: getTreemapConfiguration,
    [VisualizationTypes.DONUT]: getDonutConfiguration,
    [VisualizationTypes.FUNNEL]: getFunnelConfiguration,
    [VisualizationTypes.HEATMAP]: getHeatMapConfiguration,
    [VisualizationTypes.BUBBLE]: getBubbleConfiguration
};

export function getHighchartsOptions(chartOptions: any, drillConfig: any) {
    const getConfigurationByType = chartConfigurationMap[chartOptions.type];
    invariant(getConfigurationByType,
        `visualisation type ${chartOptions.type} is invalid (valid types: ${stringifyChartTypes()}).`);
    return merge({},
        getCommonConfiguration(chartOptions, drillConfig),
        getConfigurationByType(),
        getCustomizedConfiguration(chartOptions)
    );
}

export function isDataOfReasonableSize(chartData: any, limits: IChartLimits) {
    let result = true;

    const seriesLimit = get(limits, 'series');
    if (seriesLimit !== undefined) {
        result = result && (chartData.series.length <= seriesLimit);
    }

    const categoriesLimit = get(limits, 'categories');
    if (categoriesLimit !== undefined) {
        result = result && (chartData.categories.length <= categoriesLimit);
    }

    const dataPointsLimit = get(limits, 'dataPoints');
    if (dataPointsLimit !== undefined) {
        result = result && chartData.series.every((serie: any) => serie.data.length <= dataPointsLimit);

    }

    return result;
}
