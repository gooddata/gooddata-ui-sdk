// (C) 2007-2022 GoodData Corporation
import merge from "lodash/merge";
import invariant from "ts-invariant";
import { VisualizationTypes, IDrillConfig } from "@gooddata/sdk-ui";
import { getCommonConfiguration } from "./commonConfiguration";

import { stringifyChartTypes } from "../_util/common";

import { IChartLimits, IChartConfig } from "../../../interfaces";

import { getLineConfiguration } from "../lineChart/lineConfiguration";
import { getBarConfiguration } from "../barChart/barConfiguration";
import { getBulletConfiguration } from "../bulletChart/bulletConfiguration";
import { getColumnConfiguration } from "../columnChart/columnConfiguration";
import { getCustomizedConfiguration } from "./customConfiguration";
import { getPieConfiguration } from "../pieChart/pieConfiguration";
import { getDonutConfiguration } from "../donutChart/donutConfiguration";
import { getAreaConfiguration } from "../areaChart/areaConfiguration";
import { getScatterConfiguration } from "../scatterPlot/scatterConfiguration";
import { getComboConfiguration } from "../comboChart/comboConfiguration";
import { getTreemapConfiguration } from "../treemap/treemapConfiguration";
import { getFunnelConfiguration } from "../funnelChart/funnelConfiguration";
import { getHeatmapConfiguration } from "../heatmap/heatmapConfiguration";
import { getBubbleConfiguration } from "../bubbleChart/bubbleConfiguration";
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartOptions } from "../../typings/unsafe";
import { IntlShape } from "react-intl";
import { HighchartsOptions } from "../../lib";

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
    theme?: ITheme,
): HighchartsOptions {
    const getConfigurationByType = chartConfigurationMap[chartOptions.type];
    invariant(
        getConfigurationByType,
        `visualisation type ${chartOptions.type} is invalid (valid types: ${stringifyChartTypes()}).`,
    );
    return merge(
        {},
        getCommonConfiguration(chartOptions, drillConfig, theme),
        getConfigurationByType.call(null, config, definition, theme),
        getCustomizedConfiguration(chartOptions, config, drillConfig, intl, theme),
    );
}

export function isDataOfReasonableSize(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    chartData: any,
    limits: IChartLimits,
    isViewByTwoAttributes = false,
): boolean {
    let result = true;

    const seriesLimit = limits?.series;
    if (seriesLimit !== undefined) {
        result = result && chartData.series.length <= seriesLimit;
    }

    const categoriesLimit = limits?.categories;
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

    const dataPointsLimit = limits?.dataPoints;
    if (dataPointsLimit !== undefined) {
        result = result && chartData.series.every((serie: any) => serie.data.length <= dataPointsLimit);
    }

    return result;
}
