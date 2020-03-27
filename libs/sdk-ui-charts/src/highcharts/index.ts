// (C) 2019-2020 GoodData Corporation
import Chart from "./chart/Chart";
import ChartTransformation from "./chart/ChartTransformation";
export { Chart, ChartTransformation };
export { Visualization } from "./Visualization";

/*
 * TODO: SDK8: none of the stuff below this comment should be exported from highcharts. it should either be hidden
 *  or moved elsewhere.
 */

export { FLUID_LEGEND_THRESHOLD } from "./chart/HighChartsRenderer";
export { COMBO_SUPPORTED_CHARTS } from "./chart/chartOptions/comboChartOptions";
export { updateConfigWithSettings } from "./chart/chartOptions/chartOptionsForSettings";

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
} from "./utils/common";

export { getValidColorPalette } from "./utils/color";

import ColorUtils from "./utils/color";

export { ColorUtils };

export { BOTTOM, MIDDLE, TOP } from "./constants/alignments";
