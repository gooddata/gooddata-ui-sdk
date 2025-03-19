// (C) 2007-2024 GoodData Corporation

export type {
    IForecast,
    IChartConfig,
    PositionType,
    ILegendConfig,
    IChartLimits,
    IAxisConfig,
    IDataLabelsConfig,
    IDataPointsVisible,
    IAxisNameConfig,
    ChartAlignTypes,
    IDataLabelsVisible,
    AxisNamePosition,
    IDataPointsConfig,
    IGridConfig,
    IContinuousLineConfig,
    ITooltipConfig,
    ITotalConfig,
    IOrientationConfig,
    ChartOrientationType,
    IDisplayFormHyperlinksConfig,
    ChartRowHeight,
    ChartCellTextWrapping,
    ChartCellVerticalAlign,
    ChartCellImageSizing,
    ChartInlineVisualizationType,
    IInlineVisualizationsConfig,
    IChartClusteringConfig,
} from "./chartConfig.js";

export type {
    IBucketChartProps,
    IChartCallbacks,
    ICommonChartProps,
    ICoreChartProps,
    OnLegendReady,
    ILegendData,
    ILegendItem,
} from "./chartProps.js";

export type {
    CalculationType,
    ComparisonPosition,
    ComparisonFormat,
    ILabelConfig,
    IComparison,
    IColorConfig,
} from "./comparison.js";
export { CalculateAs, ComparisonPositionValues } from "./comparison.js";

export { ViewByAttributesLimit } from "./limits.js";

import { IColorMapping } from "@gooddata/sdk-ui-vis-commons";
export type { IColorMapping };
