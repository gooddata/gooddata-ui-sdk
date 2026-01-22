// (C) 2019-2026 GoodData Corporation

import { Chart, type IChartProps } from "./adapter/Chart.js";
import { ChartTransformation, type IChartTransformationProps } from "./ChartTransformation.js";
export { type IHighChartsRendererProps, FLUID_LEGEND_THRESHOLD } from "./adapter/HighChartsRenderer.js";
export type { IChartTransformationProps, IChartProps };
export { Chart, ChartTransformation };

/*
 * TODO: none of the stuff below this comment should be exported from highcharts. it should either be hidden
 *  or moved elsewhere.
 */
export { COMBO_SUPPORTED_CHARTS } from "./chartTypes/comboChart/comboChartOptions.js";
export { updateConfigWithSettings } from "./chartTypes/_chartOptions/chartOptionsForSettings.js";
export { updateForecastWithSettings } from "./chartTypes/_chartOptions/chartForecast.js";
export { updateOutliersWithSettings } from "./chartTypes/_chartOptions/chartOutliers.js";

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

// High contrast mode utilities for Windows High Contrast Mode support
export { isHighContrastMode } from "./utils/index.js";
