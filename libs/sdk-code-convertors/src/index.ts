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
} from "./to/yamlVisualisationToDeclarative.js";
export {
    yamlDashboardToDeclarative,
    yamlFilterContextToDeclarative,
    yamlInteractionToDeclarative,
    yamlPluginsToDeclarative,
    yamlWidgetItemToDeclarative,
    yamlWidgetToDeclarative,
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
export { table } from "./configs/table.js";
export { barChart } from "./configs/barChart.js";
export { columnChart } from "./configs/columnChart.js";
export { lineChart } from "./configs/lineChart.js";
export { areaChart } from "./configs/areaChart.js";
export { scatterChart } from "./configs/scatterChart.js";
export { bubbleChart } from "./configs/bubbleChart.js";
export { pieChart } from "./configs/pieChart.js";
export { donutChart } from "./configs/donutChart.js";
export { treemapChart } from "./configs/treemapChart.js";
export { pyramidChart } from "./configs/pyramidChart.js";
export { funnelChart } from "./configs/funnelChart.js";
export { heatmapChart } from "./configs/heatmapChart.js";
export { bulletChart } from "./configs/bulletChart.js";
export { waterfallChart } from "./configs/waterfallChart.js";
export { dependencyWheelChart } from "./configs/dependencyWheelChart.js";
export { sankeyChart } from "./configs/sankeyChart.js";
export { headlineChart } from "./configs/headlineChart.js";
export { comboChart } from "./configs/comboChart.js";
export { geoChart } from "./configs/geoChart.js";
export { geoAreaChart } from "./configs/geoAreaChart.js";
export { repeaterChart, type InlineVisualizations } from "./configs/repeaterChart.js";
export type {
    IChartFill as ChartFill,
    ChartFillType,
    ColorMapping,
    ColumnLocator,
    ColumnWidth,
    ColumnWidthItem,
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
export { getValueOrDefault, type VisualisationConfig, type ValueType } from "./configs/utils.js";

// Utils needed by orchestrators
export { generateFileName, resolveIdFromFileName, type FileNamesUsed } from "./utils/nameUtils.js";
export { assertUnreachable, type FilePath } from "./utils/sharedUtils.js";
export { convertBucketToTitle } from "./utils/convertBucketToTitle.js";
export { createIdentifier, getIdentifier } from "./utils/yamlUtils.js";
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
