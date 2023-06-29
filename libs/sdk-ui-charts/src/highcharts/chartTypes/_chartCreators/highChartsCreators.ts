// (C) 2007-2023 GoodData Corporation
import merge from "lodash/merge.js";
import { invariant } from "ts-invariant";
import { VisualizationTypes, IDrillConfig, VisType } from "@gooddata/sdk-ui";
import { getCommonConfiguration } from "./commonConfiguration.js";

import { stringifyChartTypes } from "../_util/common.js";

import { IChartLimits, IChartConfig } from "../../../interfaces/index.js";

import { getLineConfiguration } from "../lineChart/lineConfiguration.js";
import { getBarConfiguration } from "../barChart/barConfiguration.js";
import { getBulletConfiguration } from "../bulletChart/bulletConfiguration.js";
import { getColumnConfiguration } from "../columnChart/columnConfiguration.js";
import { getCustomizedConfiguration } from "./customConfiguration.js";
import { getPieConfiguration } from "../pieChart/pieConfiguration.js";
import { getDonutConfiguration } from "../donutChart/donutConfiguration.js";
import { getAreaConfiguration } from "../areaChart/areaConfiguration.js";
import { getScatterConfiguration } from "../scatterPlot/scatterConfiguration.js";
import { getComboConfiguration } from "../comboChart/comboConfiguration.js";
import { getTreemapConfiguration } from "../treemap/treemapConfiguration.js";
import { getFunnelConfiguration } from "../funnelChart/funnelConfiguration.js";
import { getPyramidConfiguration } from "../pyramidChart/pyramidConfiguration.js";
import { getHeatmapConfiguration } from "../heatmap/heatmapConfiguration.js";
import { getBubbleConfiguration } from "../bubbleChart/bubbleConfiguration.js";
import { IExecutionDefinition, ITheme } from "@gooddata/sdk-model";
import { IChartOptions, ISeriesItem } from "../../typings/unsafe.js";
import { IntlShape } from "react-intl";
import { HighchartsOptions } from "../../lib/index.js";
import { getSankeyConfiguration } from "../sankeyChart/sankeyConfiguration.js";
import { getDependencyWheelConfiguration } from "../dependencyWheelChart/dependencyWheelConfiguration.js";
import { getWaterfallConfiguration } from "../waterfallChart/waterfallConfiguration.js";

type ChartConfigurationValueType = (
    ...args: any
) =>
    | HighchartsOptions
    | ReturnType<typeof getTreemapConfiguration>
    | ReturnType<typeof getFunnelConfiguration>
    | ReturnType<typeof getPyramidConfiguration>
    | ReturnType<typeof getHeatmapConfiguration>;

const chartConfigurationMap: {
    [key in VisType]?: ChartConfigurationValueType;
} = {
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
    [VisualizationTypes.PYRAMID]: getPyramidConfiguration,
    [VisualizationTypes.HEATMAP]: getHeatmapConfiguration,
    [VisualizationTypes.BUBBLE]: getBubbleConfiguration,
    [VisualizationTypes.SANKEY]: getSankeyConfiguration,
    [VisualizationTypes.DEPENDENCY_WHEEL]: getDependencyWheelConfiguration,
    [VisualizationTypes.WATERFALL]: getWaterfallConfiguration,
};

export function getHighchartsOptions(
    chartOptions: IChartOptions,
    drillConfig: IDrillConfig,
    config?: IChartConfig,
    definition?: IExecutionDefinition,
    intl?: IntlShape,
    theme?: ITheme,
): HighchartsOptions {
    const getConfigurationByType = chartConfigurationMap[chartOptions.type as VisType];
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

    const nodesLimit = limits.nodes;
    if (nodesLimit !== undefined) {
        result = result && chartData.series.every((serie: ISeriesItem) => serie.nodes.length <= nodesLimit);
    }

    const dataPointsLimit = limits?.dataPoints;
    if (dataPointsLimit !== undefined) {
        result =
            result && chartData.series.every((serie: ISeriesItem) => serie.data.length <= dataPointsLimit);
    }

    return result;
}
