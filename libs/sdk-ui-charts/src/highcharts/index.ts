// (C) 2019-2020 GoodData Corporation
import Chart from "./Chart";
import ChartTransformation from "./ChartTransformation";
export { Chart, ChartTransformation };
export { Visualization } from "./Visualization";

/*
 * TODO: none of the stuff below this comment should be exported from highcharts. it should either be hidden
 *  or moved elsewhere.
 */

export { FLUID_LEGEND_THRESHOLD } from "./HighChartsRenderer";
export { COMBO_SUPPORTED_CHARTS } from "./chartTypes/comboChart/comboChartOptions";
export { updateConfigWithSettings } from "./_to_refactor/chartOptions/chartOptionsForSettings";

export {
    isLineChart,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isColumnChart,
    isComboChart,
    isDonutChart,
    isHeatmap,
    isTreemap,
    isScatterPlot,
    isPieChart,
    isPieOrDonutChart,
    isBulletChart,
} from "./_to_refactor/utils/common";

export { BOTTOM, MIDDLE, TOP } from "./_to_refactor/constants/alignments";

// re-exports to maintain api-compatibility
export { ColorUtils } from "@gooddata/sdk-ui-vis-commons";
export { getValidColorPalette } from "./_to_refactor/utils/color";
