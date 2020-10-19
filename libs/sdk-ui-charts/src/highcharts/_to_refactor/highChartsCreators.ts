// (C) 2007-2020 GoodData Corporation
import get from "lodash/get";
import merge from "lodash/merge";
import invariant from "ts-invariant";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { getCommonConfiguration } from "../chartTypes/_integration/commonConfiguration";

import { stringifyChartTypes } from "./utils/common";

import { IChartLimits, IChartConfig } from "../../interfaces";

import { getLineConfiguration } from "../chartTypes/lineChart/lineConfiguration";
import { getBarConfiguration } from "../chartTypes/barChart/barConfiguration";
import { getBulletConfiguration } from "../chartTypes/bulletChart/bulletConfiguration";
import { getColumnConfiguration } from "../chartTypes/columnChart/columnConfiguration";
import { getCustomizedConfiguration } from "../chartTypes/_integration/customConfiguration";
import { getPieConfiguration } from "../chartTypes/pieChart/pieConfiguration";
import { getDonutConfiguration } from "../chartTypes/donutChart/donutConfiguration";
import { getAreaConfiguration } from "../chartTypes/areaChart/areaConfiguration";
import { getScatterConfiguration } from "../chartTypes/scatterPlot/scatterConfiguration";
import { getComboConfiguration } from "../chartTypes/comboChart/comboConfiguration";
import { getTreemapConfiguration } from "../chartTypes/treemap/treemapConfiguration";
import { getFunnelConfiguration } from "../chartTypes/funnelChart/funnelConfiguration";
import { getHeatmapConfiguration } from "../chartTypes/heatmap/heatmapConfiguration";
import { getBubbleConfiguration } from "../chartTypes/bubbleChart/bubbleConfiguration";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { IChartOptions } from "../typings/unsafe";
import { IntlShape } from "react-intl";

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
    intl?: IntlShape,
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
        getCustomizedConfiguration(chartOptions, config, drillConfig, intl),
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
