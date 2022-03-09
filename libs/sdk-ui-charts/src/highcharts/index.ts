// (C) 2019-2022 GoodData Corporation
import { Chart, IChartProps } from "./adapter/Chart";
import { ChartTransformation, IChartTransformationProps } from "./ChartTransformation";
export { IHighChartsRendererProps } from "./adapter/HighChartsRenderer";
export { Chart, ChartTransformation, IChartTransformationProps, IChartProps };

/*
 * TODO: none of the stuff below this comment should be exported from highcharts. it should either be hidden
 *  or moved elsewhere.
 */

export { FLUID_LEGEND_THRESHOLD } from "./adapter/HighChartsRenderer";
export { COMBO_SUPPORTED_CHARTS } from "./chartTypes/comboChart/comboChartOptions";
export { updateConfigWithSettings } from "./chartTypes/_chartOptions/chartOptionsForSettings";

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
    isTreemap,
    isScatterPlot,
    isPieChart,
    isPieOrDonutChart,
    isBulletChart,
} from "./chartTypes/_util/common";

export { BOTTOM, MIDDLE, TOP } from "./constants/alignments";

// re-exports to maintain api-compatibility
export { ColorUtils } from "@gooddata/sdk-ui-vis-commons";
export { getValidColorPalette } from "./chartTypes/_util/color";
