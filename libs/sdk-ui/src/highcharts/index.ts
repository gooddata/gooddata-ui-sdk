// (C) 2019 GoodData Corporation
export { IChartConfig, PositionType, ILegendConfig } from "./Config";

import Chart from "./chart/Chart";
import ChartTransformation from "./chart/ChartTransformation";
export { Chart, ChartTransformation };
export { Visualization } from "./Visualization";

export { FLUID_LEGEND_THRESHOLD } from "./chart/HighChartsRenderer";
export { COMBO_SUPPORTED_CHARTS } from "./chart/chartOptions/comboChartOptions";

// TODO: SDK8: this should go away; its exported for drills

export { isLineChart, isAreaChart } from "./utils/common";

export { sanitizeConfig } from "./utils/optionalStacking/common";

export { getValidColorPalette } from "./utils/color";

import ColorUtils from "./utils/color";

export { ColorUtils };
