// (C) 2019-2024 GoodData Corporation
import { Chart, IChartProps } from "./adapter/Chart.js";
import { ChartTransformation, IChartTransformationProps } from "./ChartTransformation.js";
export type { IHighChartsRendererProps } from "./adapter/HighChartsRenderer.js";
export type { IChartTransformationProps, IChartProps };
export { Chart, ChartTransformation };

/*
 * TODO: none of the stuff below this comment should be exported from highcharts. it should either be hidden
 *  or moved elsewhere.
 */

export { FLUID_LEGEND_THRESHOLD } from "./adapter/HighChartsRenderer.js";
export { COMBO_SUPPORTED_CHARTS } from "./chartTypes/comboChart/comboChartOptions.js";
export { updateConfigWithSettings } from "./chartTypes/_chartOptions/chartOptionsForSettings.js";
export { updateForecastWithSettings } from "./chartTypes/_chartOptions/chartForecast.js";

export {
    isLineChart,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isColumnChart,
    isComboChart,
    isDonutChart,
    isHeatmap,
    isFunnel,
    isPyramid,
    isTreemap,
    isScatterPlot,
    isPieChart,
    isPieOrDonutChart,
    isBulletChart,
    isSankey,
    isDependencyWheel,
    isSankeyOrDependencyWheel,
    isWaterfall,
} from "./chartTypes/_util/common.js";

export { BOTTOM, MIDDLE, TOP } from "./constants/alignments.js";
export { ColorFactory } from "./chartTypes/_chartOptions/colorFactory.js";

// re-exports to maintain api-compatibility
export { ColorUtils } from "@gooddata/sdk-ui-vis-commons";
export { getValidColorPalette } from "./chartTypes/_util/color.js";
