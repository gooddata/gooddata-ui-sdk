// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import merge = require('lodash/merge');
import * as invariant from 'invariant';
import {
    DEFAULT_SERIES_LIMIT,
    DEFAULT_CATEGORIES_LIMIT,
    getCommonConfiguration
} from './highcharts/commonConfiguration';

import {
    stringifyChartTypes
} from '../utils/common';

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
    [VisualizationTypes.DONUT]: getDonutConfiguration
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

export function isDataOfReasonableSize(chartData: any, limits: any) {
    const seriesLimit = get(limits, 'series', DEFAULT_SERIES_LIMIT);
    const categoriesLimit = get(limits, 'categories', DEFAULT_CATEGORIES_LIMIT);
    return chartData.series.length <= seriesLimit &&
        chartData.categories.length <= categoriesLimit;
}
