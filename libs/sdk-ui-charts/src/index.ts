// (C) 2007-2026 GoodData Corporation

/**
 * This package provides a set of React-based chart visualizations that you can use to visualize your data.
 *
 * @remarks
 * These include bar charts, pie charts, line charts, and more.
 * For a table visualization, see the `@gooddata/sdk-ui-pivot` package.
 * For map-based charts, see the `@gooddata/sdk-ui-geo` package.
 *
 * @packageDocumentation
 */
export type {
    IForecast,
    IAnomalies,
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
    IDistinctPointShapes,
    PointShapeSymbolType,
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
} from "./interfaces/chartConfig.js";
export type {
    IBucketChartProps,
    IChartCallbacks,
    ICommonChartProps,
    ICoreChartProps,
    OnLegendReady,
    ILegendData,
    ILegendItem,
} from "./interfaces/chartProps.js";
export {
    type CalculationType,
    type ComparisonPosition,
    type ComparisonFormat,
    type ILabelConfig,
    type IComparison,
    type IColorConfig,
    CalculateAs,
    ComparisonPositionValues,
} from "./interfaces/comparison.js";
export { ViewByAttributesLimit } from "./interfaces/limits.js";
export { type IBaseChartProps, BaseChart } from "./charts/_base/BaseChart.js";
export { type IAreaChartProps, type IAreaChartBucketProps, AreaChart } from "./charts/areaChart/AreaChart.js";
export { type IBarChartProps, type IBarChartBucketProps, BarChart } from "./charts/barChart/BarChart.js";
export {
    type IBubbleChartProps,
    type IBubbleChartBucketProps,
    BubbleChart,
} from "./charts/bubbleChart/BubbleChart.js";
export {
    type IBulletChartProps,
    type IBulletChartBucketProps,
    BulletChart,
} from "./charts/bulletChart/BulletChart.js";
export {
    type IColumnChartProps,
    type IColumnChartBucketProps,
    ColumnChart,
} from "./charts/columnChart/ColumnChart.js";
export {
    type IComboChartProps,
    type IComboChartBucketProps,
    ComboChart,
} from "./charts/comboChart/ComboChart.js";
export {
    type IDonutChartProps,
    type IDonutChartBucketProps,
    DonutChart,
} from "./charts/donutChart/DonutChart.js";
export {
    type IFunnelChartProps,
    type IFunnelChartBucketProps,
    FunnelChart,
} from "./charts/funnelChart/FunnelChart.js";
export {
    type IPyramidChartProps,
    type IPyramidChartBucketProps,
    PyramidChart,
} from "./charts/pyramidChart/PyramidChart.js";
export { type IHeadlineProps, type IHeadlineBucketProps, Headline } from "./charts/headline/Headline.js";
export { type ICoreHeadlineExtendedProps, CoreHeadline } from "./charts/headline/CoreHeadline.js";
export { createHeadlineProvider } from "./charts/headline/HeadlineProviderFactory.js";
export {
    type ICalculationDefaultValue,
    type IDefaultLabelKeys,
    DEFAULT_COMPARISON_PALETTE,
    CALCULATION_VALUES_DEFAULT,
    ComparisonColorType,
    getCalculationValuesDefault,
    getComparisonFormat,
    getComparisonRgbColor,
} from "./charts/headline/headlineHelper.js";
export type {
    IHeadlineProvider,
    IHeadlineTransformationProps,
    ICreateExecutionParams,
} from "./charts/headline/HeadlineProvider.js";
export { type IHeatmapProps, type IHeatmapBucketProps, Heatmap } from "./charts/heatmap/Heatmap.js";
export { type ILineChartProps, type ILineChartBucketProps, LineChart } from "./charts/lineChart/LineChart.js";
export { type IPieChartProps, type IPieChartBucketProps, PieChart } from "./charts/pieChart/PieChart.js";
export {
    type IScatterPlotProps,
    type IScatterPlotBucketProps,
    ScatterPlot,
} from "./charts/scatterPlot/ScatterPlot.js";
export { type ITreemapProps, type ITreemapBucketProps, Treemap } from "./charts/treemap/Treemap.js";
export {
    type ISankeyChartProps,
    type ISankeyChartBucketProps,
    SankeyChart,
} from "./charts/sankeyChart/SankeyChart.js";
export {
    type IDependencyWheelChartProps,
    type IDependencyWheelChartBucketProps,
    DependencyWheelChart,
} from "./charts/dependencyWheelChart/DependencyWheelChart.js";
export {
    type IWaterfallChartProps,
    type IWaterfallChartBucketProps,
    WaterfallChart,
} from "./charts/waterfallChart/WaterfallChart.js";
export { type IXirrProps, type IXirrBucketProps, Xirr } from "./charts/xirr/Xirr.js";
export { CoreXirr } from "./charts/xirr/CoreXirr.js";
export {
    constructRepeaterBuckets,
    constructRepeaterDimensions,
} from "./charts/repeater/internal/repeaterExecution.js";
export { type IRepeaterProps, type IRepeaterBucketProps, Repeater } from "./charts/repeater/Repeater.js";
export {
    type ICoreRepeaterChartProps,
    type RepeaterColumnResizedCallback,
    type RepeaterColumnWidthItem,
    type RepeaterColumnWidth,
    type RepeaterDefaultColumnWidth,
    type RepeaterColumnLocator,
    type IRepeaterColumnSizing,
    type IRepeaterAbsoluteColumnWidth,
    type IRepeaterAutoColumnWidth,
    type IRepeaterAttributeColumnWidthItem,
    type IRepeaterMeasureColumnWidthItem,
    type IRepeaterAttributeColumnWidthItemBody,
    type IRepeaterMeasureColumnWidthItemBody,
    type IRepeaterAttributeColumnLocator,
    type IRepeaterAttributeColumnLocatorBody,
    type IRepeaterMeasureColumnLocator,
    type IRepeaterMeasureColumnLocatorBody,
    CoreRepeater,
} from "./charts/repeater/CoreRepeater.js";
export { withJsxExport } from "./charts/withJsxExport.js";
export {
    ColorUtils,
    TOP,
    BOTTOM,
    MIDDLE,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isBulletChart,
    isColumnChart,
    isComboChart,
    isDonutChart,
    isHeatmap,
    isFunnel,
    isPyramid,
    isLineChart,
    isPieChart,
    isPieOrDonutChart,
    isScatterPlot,
    isTreemap,
    isSankey,
    isDependencyWheel,
    isSankeyOrDependencyWheel,
    isWaterfall,
    updateConfigWithSettings,
    updateForecastWithSettings,
    updateOutliersWithSettings,
} from "./highcharts/index.js";

// export the getColorMappingPredicate so that users can import it directly without having to explicitly install vis-commons
export {
    getColorMappingPredicate,
    getPatternFillByIndex,
    getPatternFillByName,
    getPatternFill,
    type IColorMapping,
    type IPatternOptionsObject,
    type IPatternFill,
    type PatternFillName,
    type IChartFillConfig,
    type ChartFillType,
} from "@gooddata/sdk-ui-vis-commons";
