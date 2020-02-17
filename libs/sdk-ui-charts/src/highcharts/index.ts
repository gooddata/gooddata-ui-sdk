// (C) 2019-2020 GoodData Corporation
export {
    IChartConfig,
    PositionType,
    ILegendConfig,
    IChartLimits,
    IAxisConfig,
    IDataLabelsConfig,
    IAxisNameConfig,
    ChartAlignTypes,
    IColorMapping,
    IAxis,
    IDataLabelsVisible,
    IHighChartAxis,
    IMeasuresStackConfig,
    IStackLabels,
    IStackMeasuresConfig,
    IYAxisConfig,
} from "./Config";

import Chart from "./chart/Chart";
import ChartTransformation from "./chart/ChartTransformation";
export { Chart, ChartTransformation };
export { Visualization } from "./Visualization";

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
} from "./utils/common";

export { sanitizeConfig } from "./utils/optionalStacking/common";

export { getValidColorPalette } from "./utils/color";

import ColorUtils from "./utils/color";

export { ColorUtils };

export { BOTTOM, MIDDLE, TOP } from "./constants/alignments";
