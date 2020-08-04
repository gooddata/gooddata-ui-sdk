// (C) 2007-2020 GoodData Corporation
import get from "lodash/get";
import merge from "lodash/merge";
import invariant from "ts-invariant";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { getCommonConfiguration } from "./highcharts/commonConfiguration";

import { stringifyChartTypes } from "../utils/common";

import { IChartLimits, IChartConfig } from "../../interfaces";

import { getLineConfiguration } from "./highcharts/lineConfiguration";
import { getBarConfiguration } from "./highcharts/barConfiguration";
import { getBulletConfiguration } from "./highcharts/bulletConfiguration";
import { getColumnConfiguration } from "./highcharts/columnConfiguration";
import { getCustomizedConfiguration } from "./highcharts/customConfiguration";
import { getPieConfiguration } from "./highcharts/pieConfiguration";
import { getDonutConfiguration } from "./highcharts/donutConfiguration";
import { getAreaConfiguration } from "./highcharts/areaConfiguration";
import { getScatterConfiguration } from "./highcharts/scatterConfiguration";
import { getComboConfiguration } from "./highcharts/comboConfiguration";
import { getTreemapConfiguration } from "./highcharts/treemapConfiguration";
import { getFunnelConfiguration } from "./highcharts/funnelConfiguration";
import { getHeatmapConfiguration } from "./highcharts/heatmapConfiguration";
import { getBubbleConfiguration } from "./highcharts/bubbleConfiguration";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../typings/unsafe";

const chartConfigurationMap = {
    [VisualizationTypes.LINE]: getLineConfiguration,
    [VisualizationTypes.BAR]: getBarConfiguration,
    [VisualizationTypes.BULLET]: getBulletConfiguration,
    [VisualizationTypes.COLUMN]: getColumnConfiguration,
    [VisualizationTypes.PIE]: getPieConfiguration,
    [VisualizationTypes.AREA]: getAreaConfiguration,
    [VisualizationTypes.SCATTER]: getScatterConfiguration,
    [VisualizationTypes.COMBO]: getComboConfiguration,
    [VisualizationTypes.COMBO2]: getComboConfiguration,
    [VisualizationTypes.TREEMAP]: getTreemapConfiguration,
    [VisualizationTypes.DONUT]: getDonutConfiguration,
    [VisualizationTypes.FUNNEL]: getFunnelConfiguration,
    [VisualizationTypes.HEATMAP]: getHeatmapConfiguration,
    [VisualizationTypes.BUBBLE]: getBubbleConfiguration,
};

export function getHighchartsOptions(
    chartOptions: IChartOptions,
    drillConfig: IDrillConfig,
    config?: IChartConfig,
    definition?: IExecutionDefinition,
): any {
    const getConfigurationByType = chartConfigurationMap[chartOptions.type];
    invariant(
        getConfigurationByType,
        `visualisation type ${chartOptions.type} is invalid (valid types: ${stringifyChartTypes()}).`,
    );
    return merge(
        {},
        getCommonConfiguration(chartOptions, drillConfig),
        getConfigurationByType.call(null, config, definition),
        getCustomizedConfiguration(chartOptions, config, drillConfig),
    );
}

export function isDataOfReasonableSize(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    chartData: any,
    limits: IChartLimits,
    isViewByTwoAttributes = false,
): boolean {
    let result = true;

    const seriesLimit = get(limits, "series");
    if (seriesLimit !== undefined) {
        result = result && chartData.series.length <= seriesLimit;
    }

    const categoriesLimit = get(limits, "categories");
    if (categoriesLimit !== undefined) {
        if (isViewByTwoAttributes) {
            const categoriesLength = chartData.categories.reduce((result: number, category: any) => {
                return result + category.categories.length;
            }, 0);
            result = result && categoriesLength <= categoriesLimit;
        } else {
            result = result && chartData.categories.length <= categoriesLimit;
        }
    }

    const dataPointsLimit = get(limits, "dataPoints");
    if (dataPointsLimit !== undefined) {
        result = result && chartData.series.every((serie: any) => serie.data.length <= dataPointsLimit);
    }

    return result;
}
