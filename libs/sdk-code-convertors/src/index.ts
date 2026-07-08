// (C) 2024-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

// AAC schema types (curated public surface — isolates api-extractor from generated internals)
export type {
    AacAttributeHierarchy,
    AacDashboard,
    AacDashboardFilters,
    AacDataset,
    AacDateDataset,
    AacMetadata,
    AacMetric,
    AacPlugin,
    AacQuery,
    AacSection,
    AacVisualisation,
    AacFilter,
} from "./schemas/types.js";

// Core types
export {
    type ExportEntities,
    type FromEntities,
    type Profile,
    type ToExecutionResults,
    type DashboardTab,
    BucketsType,
} from "./types.js";

// Entity converters: YAML → Declarative API
export {
    yamlDatasetToDeclarative,
    buildAttributeLabels,
    buildAttributes,
    buildFacts,
    buildReferences,
} from "./to/yamlDatasetToDeclarative.js";
export { yamlDateDatesetToDeclarative } from "./to/yamlDateDatasetToDeclarative.js";
export { yamlMetricToDeclarative } from "./to/yamlMetricToDeclarative.js";
export {
    yamlVisualisationToDeclarative,
    yamlVisualisationToMetadataObject,
    yamlBucketsToDeclarative,
    yamlFiltersToDeclarative,
    yamlReportToDeclarative,
    yamlReportTotalToDeclarative,
    yamlSortsToDeclarative,
    type VisualisationDefinition,
} from "./to/yamlVisualisationToDeclarative.js";
export {
    yamlDashboardToDeclarative,
    yamlFilterContextToDeclarative,
    yamlInteractionToDeclarative,
    yamlPluginsToDeclarative,
    yamlWidgetItemToDeclarative,
    yamlWidgetToDeclarative,
    type DashboardDefinition,
    type DashboardSection,
    type DashboardWidget,
    type EmptyValueHandling,
    type FilterContextDefinition,
} from "./to/yamlDashboardToDeclarative.js";
export { yamlPluginToDeclarative } from "./to/yamlPluginToDeclarative.js";
export { yamlAttributeHierarchyToDeclarative } from "./to/yamlAttributeHierarchyToDeclarative.js";

// Entity converters: Declarative API → YAML
export { declarativeDatasetToYaml } from "./from/declarativeDatasetToYaml.js";
export { declarativeDateInstanceToYaml } from "./from/declarativeDateInstanceToYaml.js";
export { declarativeMetricToYaml } from "./from/declarativeMetricToYaml.js";
export {
    declarativeVisualisationToYaml,
    declarativeVisTypeToYaml,
    declarativeAbsoluteDateFilterToYaml,
    declarativeArithmeticMetricToYaml,
    declarativeAttributeSortToYaml,
    declarativeAttributeToYaml,
    declarativeBucketsToYaml,
    declarativeFiltersToYaml,
    declarativeInlineMetricToYaml,
    declarativeMeasureSortToYaml,
    declarativeMeasureValueFilterToYaml,
    declarativeNegativeAttributeFilterToYaml,
    declarativeNormalMetricToYaml,
    declarativePoPMetricToYaml,
    declarativePreviousPeriodMetricToYaml,
    declarativePositiveAttributeFilterToYaml,
    declarativeRankingFilterToYaml,
    declarativeRelativeDateFilterToYaml,
    declarativeSortsToYaml,
    declarativeTotalToYaml,
    type YamlSorts,
    type YamlPostProcessors,
    type YamlBuckets,
    type YamlBucketGroup,
    type YamlBucketGroupItems,
    type YamlFieldData,
    type YamlFilterMapEntry,
    type YamlFilters,
} from "./from/declarativeVisualisationToYaml.js";
export {
    declarativeDashboardToYaml,
    declarativeDrillToYaml,
    declarativeFilterContextToYaml,
    declarativeFiltersConfigToYaml,
    declarativePluginsToYaml,
    declarativeSectionsToYaml,
    declarativeTabsToYaml,
    declarativeWidgetToYaml,
    type FilterContextItem,
    type OverrideDashboardDefinition,
} from "./from/declarativeDashboardToYaml.js";
export { declarativePluginToYaml } from "./from/declarativePluginToYaml.js";
export { declarativeAttributeHierarchyToYaml } from "./from/declarativeAttributeHierarchyToYaml.js";

// Execution
export { buildAfmExecution } from "./execution/buildAfmExecution.js";

// Constants
export {
    DatasetTypes,
    DateDatasetTypes,
    MetricTypes,
    DashboardTypes,
    PluginTypes,
    AttributeHierarchyTypes,
    VisualisationsTypes,
    AllTypes,
} from "./conts.js";

// Configs
export {
    table,
    tableLoad,
    tableSave,
    TABLE_DEFAULTS,
    type ITableConfig,
    type TableConfigProperties,
} from "./configs/table.js";
export {
    barChart,
    barChartLoad,
    barChartSave,
    BAR_CHART_DEFAULTS,
    type IBarChartConfig,
    type BarChartConfigProperties,
} from "./configs/barChart.js";
export {
    columnChart,
    columnChartLoad,
    columnChartSave,
    COLUMN_CHART_DEFAULTS,
    type IColumnChartConfig,
    type ColumnChartConfigProperties,
} from "./configs/columnChart.js";
export {
    lineChart,
    lineChartLoad,
    lineChartSave,
    LINE_CHART_DEFAULTS,
    type ILineChartConfig,
    type LineChartConfigProperties,
} from "./configs/lineChart.js";
export {
    areaChart,
    areaChartLoad,
    areaChartSave,
    AREA_CHART_DEFAULTS,
    type IAreaChartConfig,
    type AreaChartConfigProperties,
} from "./configs/areaChart.js";

export {
    scatterChart,
    scatterChartLoad,
    scatterChartSave,
    SCATTER_CHART_DEFAULTS,
    type IScatterChartConfig,
    type ScatterChartConfigProperties,
} from "./configs/scatterChart.js";
export {
    bubbleChart,
    bubbleChartLoad,
    bubbleChartSave,
    BUBBLE_CHART_DEFAULTS,
    type IBubbleChartConfig,
    type BubbleChartConfigProperties,
} from "./configs/bubbleChart.js";
export {
    pieChart,
    pieChartLoad,
    pieChartSave,
    PIE_CHART_DEFAULTS,
    type IPieChartConfig,
    type PieChartConfigProperties,
} from "./configs/pieChart.js";
export {
    donutChart,
    donutChartLoad,
    donutChartSave,
    DONUT_CHART_DEFAULTS,
    type IDonutChartConfig,
    type DonutChartConfigProperties,
} from "./configs/donutChart.js";
export {
    treemapChart,
    treemapChartLoad,
    treemapChartSave,
    TREEMAP_CHART_DEFAULTS,
    type ITreemapChartConfig,
    type TreemapChartConfigProperties,
} from "./configs/treemapChart.js";
export {
    pyramidChart,
    pyramidChartLoad,
    pyramidChartSave,
    PYRAMID_CHART_DEFAULTS,
    type IPyramidChartConfig,
    type PyramidChartConfigProperties,
} from "./configs/pyramidChart.js";
export {
    funnelChart,
    funnelChartLoad,
    funnelChartSave,
    FUNNEL_CHART_DEFAULTS,
    type IFunnelChartConfig,
    type FunnelChartConfigProperties,
} from "./configs/funnelChart.js";
export {
    heatmapChart,
    heatmapChartLoad,
    heatmapChartSave,
    HEATMAP_CHART_DEFAULTS,
    type IHeatmapChartConfig,
    type HeatmapChartConfigProperties,
} from "./configs/heatmapChart.js";
export {
    bulletChart,
    bulletChartLoad,
    bulletChartSave,
    BULLET_CHART_DEFAULTS,
    type IBulletChartConfig,
    type BulletChartConfigProperties,
} from "./configs/bulletChart.js";
export {
    waterfallChart,
    waterfallChartLoad,
    waterfallChartSave,
    WATERFALL_CHART_DEFAULTS,
    type IWaterfallChartConfig,
    type WaterfallChartConfigProperties,
} from "./configs/waterfallChart.js";
export {
    dependencyWheelChart,
    dependencyWheelChartLoad,
    dependencyWheelChartSave,
    DEPENDENCY_WHEEL_CHART_DEFAULTS,
    type IDependencyWheelChartConfig,
    type DependencyWheelChartConfigProperties,
} from "./configs/dependencyWheelChart.js";
export {
    sankeyChart,
    sankeyChartLoad,
    sankeyChartSave,
    SANKEY_CHART_DEFAULTS,
    type ISankeyChartConfig,
    type SankeyChartConfigProperties,
} from "./configs/sankeyChart.js";
export {
    headlineChart,
    headlineChartLoad,
    headlineChartSave,
    HEADLINE_CHART_DEFAULTS,
    type IHeadlineChartConfig,
    type HeadlineChartConfigProperties,
} from "./configs/headlineChart.js";
export {
    comboChart,
    comboChartLoad,
    comboChartSave,
    COMBO_CHART_DEFAULTS,
    type IComboChartConfig,
    type ComboChartConfigProperties,
} from "./configs/comboChart.js";
export {
    geoChart,
    geoChartLoad,
    geoChartSave,
    GEO_CHART_DEFAULTS,
    type IGeoChartConfig,
    type GeoChartConfigProperties,
} from "./configs/geoChart.js";
export {
    geoAreaChart,
    geoAreaChartLoad,
    geoAreaChartSave,
    GEO_AREA_CHART_DEFAULTS,
    type IGeoAreaChartConfig,
    type GeoAreaChartConfigProperties,
} from "./configs/geoAreaChart.js";
export {
    repeaterChart,
    repeaterChartLoad,
    repeaterChartSave,
    REPEATER_CHART_DEFAULTS,
    saveInlineVisualizations,
    type IRepeaterChartConfig,
    type RepeaterChartConfigProperties,
    type InlineVisualizations,
} from "./configs/repeaterChart.js";
export type {
    IChartFill as ChartFill,
    ChartFillType,
    ColorMapping,
    ColumnLocator,
    ColumnWidth,
    ColumnWidthItem,
    ICustomTooltip as CustomTooltip,
    CustomTooltipPlacement,
    IAbsoluteColumnWidth,
    IAllMeasureColumnWidthItem,
    IAllMeasureColumnWidthItemBody,
    IAttributeColumnLocator,
    IAttributeColumnLocatorBody,
    IAttributeColumnWidthItem,
    IAttributeColumnWidthItemBody,
    IAutoColumnWidth,
    IMeasureColumnLocator,
    IMeasureColumnLocatorBody,
    IMeasureColumnWidthItem,
    IMeasureColumnWidthItemBody,
    IMixedValuesColumnWidthItem,
    IMixedValuesColumnWidthItemBody,
    ISliceMeasureColumnWidthItem,
    ISliceMeasureColumnWidthItemBody,
    ITotalColumnLocator,
    ITotalColumnLocatorBody,
    IWeakMeasureColumnWidthItem,
    IWeakMeasureColumnWidthItemBody,
    PatternFillName,
    PointShapeSymbol,
} from "./configs/types.js";
export {
    getValueOrDefault,
    type ConfigDefaults,
    type VisualisationConfig,
    type ValueType,
} from "./configs/utils.js";

// Utils needed by orchestrators
export { generateFileName, resolveIdFromFileName, type FileNamesUsed } from "./utils/nameUtils.js";
export { assertUnreachable, type FilePath, type FullFields } from "./utils/sharedUtils.js";
export { convertBucketToTitle } from "./utils/convertBucketToTitle.js";
export { createIdentifier, getIdentifier } from "./utils/yamlUtils.js";
export {
    type IErrorContext,
    type ICoreError,
    CoreErrorCode,
    CoreErrorTypes,
    CoreErrorMessages,
} from "./utils/errors.js";
export {
    loadColorMapping,
    loadColumnsWidth,
    saveColorMapping,
    saveColumnWidths,
} from "./utils/configUtils.js";
export {
    fromDeclarativePermissions,
    toDeclarativePermissions,
    type GenericAssigneePermission,
    type GenericAssigneeRulePermission,
    type GenericPermission,
    type Permissions,
} from "./utils/permissionUtils.js";
