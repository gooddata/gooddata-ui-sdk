// (C) 2020-2025 GoodData Corporation

import { IEarlyAccessFeaturesConfig, IProductionFeaturesConfig } from "@gooddata/sdk-model";

/**
 * This is list of feature flags managed on Panther by FeatureHub
 * and keeping their default values for non-managed env
 */

export enum TigerFeaturesNames {
    // Remove this FF only after 8.12.0 end of life. The following selector is missing parentheses and is not correctly set to true when FF is missing (read more in ticket RAIL-4970)
    // https://github.com/gooddata/gooddata-ui-sdk/commit/cd47ff9115fc944be721dfda9d58ede00c7c15e9#diff-d047b642946d563ff25cca09624eede9a605d2b8809bac26531324507de4e546R313
    DashboardEditModeDevRollout = "dashboardEditModeDevRollout",
    EnableMetricSqlAndDataExplain = "enableMetricSqlAndDataExplain",
    EnableDescriptions = "enableDescriptions",
    EnableKPIDashboardExportPDF = "enableKPIDashboardExportPDF",
    EnableSqlDatasets = "enableSqlDatasets",
    EnableFunnelChart = "enableFunnelChart",
    EnableHighchartsAccessibility = "enableHighchartsAccessibility",
    EnableAccessibleChartTooltip = "enableAccessibleChartTooltip",
    EnablePyramidChart = "enablePyramidChart",
    EnableSankeyChart = "enableSankeyChart",
    EnableDependencyWheelChart = "enableDependencyWheelChart",
    EnableWaterfallChart = "enableWaterfallChart",
    EnableCompositeGrain = "enableCompositeGrain",
    EnableTableTotalRows = "enableTableTotalRows",
    EnablePivotTableIncreaseBucketSize = "enablePivotTableIncreaseBucketSize",
    EnableUserManagement = "enableUserManagement",
    EnableKDSavedFilters = "enableKDSavedFilters",
    EnableClickHouseDataSource = "enableClickHouseDataSource",
    EnableKDCrossFiltering = "enableKDCrossFiltering",
    EnableChangeAnalysis = "enableChangeAnalysis",
    EnableMultipleDateFilters = "enableMultipleDateFilters",
    EnableKDRichText = "enableKDRichText",
    EnableMySqlDataSource = "enableMySqlDataSource",
    EnableCreateUser = "enableCreateUser",
    EnableMariaDbDataSource = "enableMariaDbDataSource",
    EnableRepeaterChart = "enableRepeaterChart",
    EnableKDAttributeFilterDatesValidation = "enableKDAttributeFilterDatesValidation",
    EnableKDVisualizationSwitcher = "enableKDVisualizationSwitcher",
    EnableOracleDataSource = "enableOracleDataSource",
    EnableAnalyticalCatalog = "enableAnalyticalCatalog",
    EnableAlerting = "enableAlerting",
    EnableAlertingAttributes = "enableAlertAttributes",
    EnableComparisonInAlerting = "enableComparisonInAlerting",
    EnableSmtp = "enableSmtp",
    EnableScheduling = "enableScheduling",
    EnableSmartFunctions = "enableSmartFunctions",
    EnableMotherDuckDataSource = "enableMotherDuckDataSource",
    EnableMongoDbDataSource = "enableMongoDbDataSource",
    EnableLabsSmartFunctions = "enableLabsSmartFunctions",
    EnableKeyDriverAnalysis = "enableKeyDriverAnalysis",
    EnableDataProfiling = "enableDataProfiling",
    EnableFlexAi = "enableFlexAi",
    EnableExperimentalFeaturesUI = "enableExperimentalFeaturesUI",
    EnableSingleStoreDataSource = "enableSingleStoreDataSource",
    EnableSnowflakeKeyPairAuthentication = "enableSnowflakeKeyPairAuthentication",
    EnableMultipleDataSourcesInWorkspace = "enableMultipleDataSourcesInWorkspace",
    EnableScatterPlotSegmentation = "enableScatterPlotSegmentation",
    EnableScatterPlotClustering = "enableScatterPlotClustering",
    EnableRichTextDescriptions = "enableRichTextDescriptions",
    EnableSchedulingRollout = "enableSchedulingRollout",
    EnableWidgetIdentifiersRollout = "enableWidgetIdentifiersRollout",
    EnableAIFunctions = "enableAIFunctions",
    EnableSemanticSearch = "enableSemanticSearch",
    EnableSemanticSearchRollout = "enableSemanticSearchRollout",
    EnableGenAIChat = "enableGenAIChat",
    EnableGenAIChatRollout = "enableGenAIChatRollout",
    EnableGenAICatalogQualityChecker = "enableGenAICatalogQualityChecker",
    EnableDashboardFilterViews = "enableDashboardFilterViews",
    EnableAlertingRollout = "enableAlertingRollout",
    EnableNewInsightChangedPostMessageEvent = "enableNewInsightChangedPostMessageEvent",
    EnableIgnoreCrossFiltering = "enableIgnoreCrossFiltering",
    EnableHeadlineExport = "enableHeadlineExport",
    EarlyAccessFeatures = "earlyAccessFeatures",
    EnableCrossFilteringAliasTitles = "enableCrossFilteringAliasTitles",
    EnableDefaultSmtp = "enableDefaultSmtp",
    EnableNumberSeparators = "enableNumberSeparators",
    EnableDestinationTesting = "enableDestinationTesting",
    EnableInPlatformNotifications = "enableInPlatformNotifications",
    EnableExternalRecipients = "enableExternalRecipients",
    EnableDrilledTooltip = "enableDrilledTooltip",
    EnableVisualizationFineTuning = "enableVisualizationFineTuning",
    EnableDashboardDescriptionDynamicHeight = "enableDashboardDescriptionDynamicHeight",
    EnableAmplitudeTracker = "enableAmplitudeTracker",
    EnableSlideshowExports = "enableSlideshowExports",
    EnableRawExports = "enableRawExports",
    EnableChartAccessibilityFeatures = "enableChartAccessibilityFeatures",
    EnableDashboardFiltersApplyModes = "enableDashboardFiltersApplyModes",
    EnableExecutionCancelling = "enableExecutionCancelling",
    EnableDashboardTabularExport = "enableDashboardTabularExport",
    EnableOrchestratedTabularExports = "enableOrchestratedTabularExports",
    EnableImmediateAttributeFilterDisplayAsLabelMigration = "enableImmediateAttributeFilterDisplayAsLabelMigration",
    EnableRichTextDynamicReferences = "enableRichTextDynamicReferences",
    EnableAnalyticalDesignerCatalogSideload = "enableAnalyticalDesignerCatalogSideload",
    EnableDashboardShareLink = "enableDashboardShareLink",
    EnableExecutionTimestamp = "enableExecutionTimestamp",
    EnableAutomationFilterContext = "enableAutomationFilterContext",
    EnableDateFilterIdentifiersRollout = "enableDateFilterIdentifiersRollout",
    EnableAlertsEvaluationFrequencySetup = "enableAlertsEvaluationFrequencySetup",
    EnableRichTooManyDatapointsErrors = "enableRichTooManyDatapointsErrors",
    EnableLineChartTrendThreshold = "enableLineChartTrendThreshold",
    EnableKDRespectLegendPosition = "enableKDRespectLegendPosition",
    EnableWorkspaceSettingsAppHeaderMenuItem = "enableWorkspaceSettingsAppHeaderMenuItem",
    EnableSnapshotExportAccessibility = "enableSnapshotExportAccessibility",
    EnableWidgetExportPngImage = "enableWidgetExportPngImage",
    EnableExportToDocumentStorage = "enableExportToDocumentStorage",
    EnableAttributeFilterVirtualised = "enableAttributeFilterVirtualised",
    EnableNotificationChannelIdentifiers = "enableNotificationChannelIdentifiers",
    EnableDashboardShareDialogLink = "enableDashboardShareDialogLink",
    ProductionFeatures = "productionFeatures",
    EnableNewScheduledExport = "enableNewScheduledExport",
    EnableSeamlessIdpSwitch = "enableSeamlessIdpSwitch",
    EnablePreAggregationDatasets = "enablePreAggregationDatasets",
    EnableToDateFilters = "enableToDateFilters",
    EnableCyclicalToDateFilters = "enableCyclicalToDateFilters",
    EnableNewPivotTable = "enableNewPivotTable",
    EnableNewGeoPushpin = "enableNewGeoPushpin",
    EnableAutomationManagement = "enableAutomationManagement",
    EnableNewPdfTabularExport = "enableNewPdfTabularExport",
    EnableFilterAccessibility = "enableFilterAccessibility",
    EnableGenAIMemory = "enableGenAIMemory",
    AIChatSearchLimit = "aiChatSearchLimit",
    EnableDashboardTabs = "enableDashboardTabs",
    EnablePivotTableAutoSizeReset = "enablePivotTableAutoSizeReset",
    EnablePreserveFilterSelectionDuringInit = "enablePreserveFilterSelectionDuringInit",
}

export type ITigerFeatureFlags = {
    dashboardEditModeDevRollout: (typeof FeatureFlagsValues)["dashboardEditModeDevRollout"][number];
    enableMetricSqlAndDataExplain: (typeof FeatureFlagsValues)["enableMetricSqlAndDataExplain"][number];
    enableDescriptions: (typeof FeatureFlagsValues)["enableDescriptions"][number];
    enableKPIDashboardExportPDF: (typeof FeatureFlagsValues)["enableKPIDashboardExportPDF"][number];
    enableSqlDatasets: (typeof FeatureFlagsValues)["enableSqlDatasets"][number];
    enableFunnelChart: (typeof FeatureFlagsValues)["enableFunnelChart"][number];
    enablePyramidChart: (typeof FeatureFlagsValues)["enablePyramidChart"][number];
    enableSankeyChart: (typeof FeatureFlagsValues)["enableSankeyChart"][number];
    enableDependencyWheelChart: (typeof FeatureFlagsValues)["enableDependencyWheelChart"][number];
    enableWaterfallChart: (typeof FeatureFlagsValues)["enableWaterfallChart"][number];
    enableCompositeGrain: (typeof FeatureFlagsValues)["enableCompositeGrain"][number];
    enableTableTotalRows: (typeof FeatureFlagsValues)["enableTableTotalRows"][number];
    enablePivotTableIncreaseBucketSize: (typeof FeatureFlagsValues)["enablePivotTableIncreaseBucketSize"][number];
    enableUserManagement: (typeof FeatureFlagsValues)["enableUserManagement"][number];
    enableKDSavedFilters: (typeof FeatureFlagsValues)["enableKDSavedFilters"][number];
    enableClickHouseDataSource: (typeof FeatureFlagsValues)["enableClickHouseDataSource"][number];
    enableKDCrossFiltering: (typeof FeatureFlagsValues)["enableKDCrossFiltering"][number];
    enableChangeAnalysis: (typeof FeatureFlagsValues)["enableChangeAnalysis"][number];
    enableMultipleDateFilters: (typeof FeatureFlagsValues)["enableMultipleDateFilters"][number];
    enableKDRichText: (typeof FeatureFlagsValues)["enableKDRichText"][number];
    enableMySqlDataSource: (typeof FeatureFlagsValues)["enableMySqlDataSource"][number];
    enableCreateUser: (typeof FeatureFlagsValues)["enableCreateUser"][number];
    enableMariaDbDataSource: (typeof FeatureFlagsValues)["enableMariaDbDataSource"][number];
    enableRepeaterChart: (typeof FeatureFlagsValues)["enableRepeaterChart"][number];
    enableKDAttributeFilterDatesValidation: (typeof FeatureFlagsValues)["enableKDAttributeFilterDatesValidation"][number];
    enableOracleDataSource: (typeof FeatureFlagsValues)["enableOracleDataSource"][number];
    enableAnalyticalCatalog: (typeof FeatureFlagsValues)["enableAnalyticalCatalog"][number];
    enableAlerting: (typeof FeatureFlagsValues)["enableAlerting"][number];
    enableAlertAttributes: (typeof FeatureFlagsValues)["enableAlertAttributes"][number];
    enableComparisonInAlerting: (typeof FeatureFlagsValues)["enableComparisonInAlerting"][number];
    enableSmtp: (typeof FeatureFlagsValues)["enableSmtp"][number];
    enableScheduling: (typeof FeatureFlagsValues)["enableScheduling"][number];
    enableLabsSmartFunctions: (typeof FeatureFlagsValues)["enableLabsSmartFunctions"][number];
    enableSmartFunctions: (typeof FeatureFlagsValues)["enableSmartFunctions"][number];
    enableMotherDuckDataSource: (typeof FeatureFlagsValues)["enableMotherDuckDataSource"][number];
    enableMongoDbDataSource: (typeof FeatureFlagsValues)["enableMongoDbDataSource"][number];
    enableKeyDriverAnalysis: (typeof FeatureFlagsValues)["enableKeyDriverAnalysis"][number];
    enableDataProfiling: (typeof FeatureFlagsValues)["enableDataProfiling"][number];
    enableFlexAi: (typeof FeatureFlagsValues)["enableFlexAi"][number];
    enableExperimentalFeaturesUI: (typeof FeatureFlagsValues)["enableExperimentalFeaturesUI"][number];
    enableSingleStoreDataSource: (typeof FeatureFlagsValues)["enableSingleStoreDataSource"][number];
    enableSnowflakeKeyPairAuthentication: (typeof FeatureFlagsValues)["enableSnowflakeKeyPairAuthentication"][number];
    enableMultipleDataSourcesInWorkspace: (typeof FeatureFlagsValues)["enableMultipleDataSourcesInWorkspace"][number];
    enableScatterPlotSegmentation: (typeof FeatureFlagsValues)["enableScatterPlotSegmentation"][number];
    enableScatterPlotClustering: (typeof FeatureFlagsValues)["enableScatterPlotClustering"][number];
    enableRichTextDescriptions: (typeof FeatureFlagsValues)["enableRichTextDescriptions"][number];
    enableSchedulingRollout: (typeof FeatureFlagsValues)["enableSchedulingRollout"][number];
    enableWidgetIdentifiersRollout: (typeof FeatureFlagsValues)["enableWidgetIdentifiersRollout"][number];
    enableAIFunctions: (typeof FeatureFlagsValues)["enableAIFunctions"][number];
    enableSemanticSearch: (typeof FeatureFlagsValues)["enableSemanticSearch"][number];
    enableSemanticSearchRollout: (typeof FeatureFlagsValues)["enableSemanticSearchRollout"][number];
    enableGenAIChat: (typeof FeatureFlagsValues)["enableGenAIChat"][number];
    enableGenAIChatRollout: (typeof FeatureFlagsValues)["enableGenAIChatRollout"][number];
    enableGenAICatalogQualityChecker: (typeof FeatureFlagsValues)["enableGenAICatalogQualityChecker"][number];
    enableAlertingRollout: (typeof FeatureFlagsValues)["enableAlertingRollout"][number];
    enableDashboardFilterViews: (typeof FeatureFlagsValues)["enableDashboardFilterViews"][number];
    enableNewInsightChangedPostMessageEvent: (typeof FeatureFlagsValues)["enableNewInsightChangedPostMessageEvent"][number];
    enableKDVisualizationSwitcher: (typeof FeatureFlagsValues)["enableKDVisualizationSwitcher"][number];
    enableIgnoreCrossFiltering: (typeof FeatureFlagsValues)["enableIgnoreCrossFiltering"][number];
    enableHeadlineExport: (typeof FeatureFlagsValues)["enableHeadlineExport"][number];
    earlyAccessFeatures: (typeof FeatureFlagsValues)["earlyAccessFeatures"][number];
    enableCrossFilteringAliasTitles: (typeof FeatureFlagsValues)["enableCrossFilteringAliasTitles"][number];
    enableDefaultSmtp: (typeof FeatureFlagsValues)["enableDefaultSmtp"][number];
    enableNumberSeparators: (typeof FeatureFlagsValues)["enableNumberSeparators"][number];
    enableDestinationTesting: (typeof FeatureFlagsValues)["enableDestinationTesting"][number];
    enableInPlatformNotifications: (typeof FeatureFlagsValues)["enableInPlatformNotifications"][number];
    enableVisualizationFineTuning: (typeof FeatureFlagsValues)["enableVisualizationFineTuning"][number];
    enableExternalRecipients: (typeof FeatureFlagsValues)["enableExternalRecipients"][number];
    enableDashboardTabularExport: (typeof FeatureFlagsValues)["enableDashboardTabularExport"][number];
    enableOrchestratedTabularExports: (typeof FeatureFlagsValues)["enableOrchestratedTabularExports"][number];
    enableDrilledTooltip: (typeof FeatureFlagsValues)["enableDrilledTooltip"][number];
    enableDashboardDescriptionDynamicHeight: (typeof FeatureFlagsValues)["enableDashboardDescriptionDynamicHeight"][number];
    enableAmplitudeTracker: (typeof FeatureFlagsValues)["enableAmplitudeTracker"][number];
    enableSlideshowExports: (typeof FeatureFlagsValues)["enableSlideshowExports"][number];
    enableRawExports: (typeof FeatureFlagsValues)["enableRawExports"][number];
    enableDashboardFiltersApplyModes: (typeof FeatureFlagsValues)["enableDashboardFiltersApplyModes"][number];
    enableExecutionCancelling: (typeof FeatureFlagsValues)["enableExecutionCancelling"][number];
    enableImmediateAttributeFilterDisplayAsLabelMigration: (typeof FeatureFlagsValues)["enableImmediateAttributeFilterDisplayAsLabelMigration"][number];
    enableRichTextDynamicReferences: (typeof FeatureFlagsValues)["enableRichTextDynamicReferences"][number];
    enableAnalyticalDesignerCatalogSideload: (typeof FeatureFlagsValues)["enableAnalyticalDesignerCatalogSideload"][number];
    enableDashboardShareLink: (typeof FeatureFlagsValues)["enableDashboardShareLink"][number];
    enableHighchartsAccessibility: (typeof FeatureFlagsValues)["enableHighchartsAccessibility"][number];
    enableChartAccessibilityFeatures: (typeof FeatureFlagsValues)["enableChartAccessibilityFeatures"][number];
    enableAccessibleChartTooltip: (typeof FeatureFlagsValues)["enableAccessibleChartTooltip"][number];
    enableExecutionTimestamp: (typeof FeatureFlagsValues)["enableExecutionTimestamp"][number];
    enableAutomationFilterContext: (typeof FeatureFlagsValues)["enableAutomationFilterContext"][number];
    enableDateFilterIdentifiersRollout: (typeof FeatureFlagsValues)["enableDateFilterIdentifiersRollout"][number];
    enableAlertsEvaluationFrequencySetup: (typeof FeatureFlagsValues)["enableAlertsEvaluationFrequencySetup"][number];
    enableRichTooManyDatapointsErrors: (typeof FeatureFlagsValues)["enableRichTooManyDatapointsErrors"][number];
    enableLineChartTrendThreshold: (typeof FeatureFlagsValues)["enableLineChartTrendThreshold"][number];
    enableKDRespectLegendPosition: (typeof FeatureFlagsValues)["enableKDRespectLegendPosition"][number];
    enableWorkspaceSettingsAppHeaderMenuItem: (typeof FeatureFlagsValues)["enableWorkspaceSettingsAppHeaderMenuItem"][number];
    enableSnapshotExportAccessibility: (typeof FeatureFlagsValues)["enableSnapshotExportAccessibility"][number];
    enableWidgetExportPngImage: (typeof FeatureFlagsValues)["enableWidgetExportPngImage"][number];
    enableExportToDocumentStorage: (typeof FeatureFlagsValues)["enableExportToDocumentStorage"][number];
    enableAttributeFilterVirtualised: (typeof FeatureFlagsValues)["enableAttributeFilterVirtualised"][number];
    enableNotificationChannelIdentifiers: (typeof FeatureFlagsValues)["enableNotificationChannelIdentifiers"][number];
    enableDashboardShareDialogLink: (typeof FeatureFlagsValues)["enableDashboardShareDialogLink"][number];
    productionFeatures: (typeof FeatureFlagsValues)["productionFeatures"][number];
    enableNewScheduledExport: (typeof FeatureFlagsValues)["enableNewScheduledExport"][number];
    enableSeamlessIdpSwitch: (typeof FeatureFlagsValues)["enableSeamlessIdpSwitch"][number];
    enablePreAggregationDatasets: (typeof FeatureFlagsValues)["enablePreAggregationDatasets"][number];
    enableToDateFilters: (typeof FeatureFlagsValues)["enableToDateFilters"][number];
    enableCyclicalToDateFilters: (typeof FeatureFlagsValues)["enableCyclicalToDateFilters"][number];
    enableNewPivotTable: (typeof FeatureFlagsValues)["enableNewPivotTable"][number];
    enableNewGeoPushpin: (typeof FeatureFlagsValues)["enableNewGeoPushpin"][number];
    enableAutomationManagement: (typeof FeatureFlagsValues)["enableAutomationManagement"][number];
    enableNewPdfTabularExport: (typeof FeatureFlagsValues)["enableNewPdfTabularExport"][number];
    enableFilterAccessibility: (typeof FeatureFlagsValues)["enableFilterAccessibility"][number];
    enableGenAIMemory: (typeof FeatureFlagsValues)["enableGenAIMemory"][number];
    aiChatSearchLimit: (typeof FeatureFlagsValues)["aiChatSearchLimit"][number];
    enableDashboardTabs: (typeof FeatureFlagsValues)["enableDashboardTabs"][number];
    enablePivotTableAutoSizeReset: (typeof FeatureFlagsValues)["enablePivotTableAutoSizeReset"][number];
    enablePreserveFilterSelectionDuringInit: (typeof FeatureFlagsValues)["enablePreserveFilterSelectionDuringInit"][number];
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    dashboardEditModeDevRollout: true,
    enableMetricSqlAndDataExplain: false,
    enableDescriptions: true,
    enableKPIDashboardExportPDF: true,
    enableSqlDatasets: false,
    enableFunnelChart: true,
    enablePyramidChart: true,
    enableSankeyChart: true,
    enableDependencyWheelChart: true,
    enableWaterfallChart: true,
    enableCompositeGrain: false,
    enableTableTotalRows: true,
    enablePivotTableIncreaseBucketSize: true,
    enableUserManagement: true,
    enableKDSavedFilters: true,
    enableClickHouseDataSource: false,
    enableKDCrossFiltering: true,
    enableChangeAnalysis: false,
    enableMultipleDateFilters: true,
    enableKDRichText: true,
    enableMySqlDataSource: false,
    enableCreateUser: true,
    enableMariaDbDataSource: false,
    enableRepeaterChart: true,
    enableKDAttributeFilterDatesValidation: true,
    enableMotherDuckDataSource: false,
    enableMongoDbDataSource: false,
    enableOracleDataSource: false,
    enableAnalyticalCatalog: false,
    enableAlerting: true,
    enableAlertAttributes: true,
    enableComparisonInAlerting: true,
    enableSmtp: true,
    enableScheduling: true,
    enableLabsSmartFunctions: false,
    enableSmartFunctions: true,
    enableKeyDriverAnalysis: false,
    enableDataProfiling: false,
    enableFlexAi: false,
    enableExperimentalFeaturesUI: false,
    enableSingleStoreDataSource: false,
    enableSnowflakeKeyPairAuthentication: true,
    enableMultipleDataSourcesInWorkspace: true,
    enableScatterPlotSegmentation: true,
    enableScatterPlotClustering: true,
    enableRichTextDescriptions: true,
    enableSchedulingRollout: false,
    enableWidgetIdentifiersRollout: true,
    enableAIFunctions: false,
    enableSemanticSearch: false,
    enableSemanticSearchRollout: false,
    enableGenAIChat: false,
    enableGenAIChatRollout: false,
    enableGenAICatalogQualityChecker: false,
    enableAlertingRollout: false,
    enableDashboardFilterViews: true,
    enableNewInsightChangedPostMessageEvent: false,
    enableKDVisualizationSwitcher: true,
    enableIgnoreCrossFiltering: true,
    enableHeadlineExport: true,
    earlyAccessFeatures: undefined,
    enableCrossFilteringAliasTitles: true,
    enableDefaultSmtp: false,
    enableNumberSeparators: true,
    enableDestinationTesting: true,
    enableInPlatformNotifications: true,
    enableVisualizationFineTuning: false,
    enableExternalRecipients: true,
    enableDashboardTabularExport: false,
    enableOrchestratedTabularExports: false,
    enableDrilledTooltip: true,
    enableDashboardDescriptionDynamicHeight: false,
    enableAmplitudeTracker: false,
    enableSlideshowExports: true,
    enableRawExports: false,
    enableDashboardFiltersApplyModes: true,
    enableExecutionCancelling: false,
    enableImmediateAttributeFilterDisplayAsLabelMigration: false,
    enableRichTextDynamicReferences: true,
    enableAnalyticalDesignerCatalogSideload: false,
    enableDashboardShareLink: true,
    enableHighchartsAccessibility: false,
    enableChartAccessibilityFeatures: true,
    enableAccessibleChartTooltip: false,
    enableExecutionTimestamp: true,
    enableAutomationFilterContext: true,
    enableDateFilterIdentifiersRollout: true,
    enableAlertsEvaluationFrequencySetup: true,
    enableRichTooManyDatapointsErrors: false,
    enableLineChartTrendThreshold: true,
    enableKDRespectLegendPosition: true,
    enableWorkspaceSettingsAppHeaderMenuItem: false,
    enableSnapshotExportAccessibility: false,
    enableWidgetExportPngImage: true,
    enableExportToDocumentStorage: false,
    enableAttributeFilterVirtualised: true,
    enableNotificationChannelIdentifiers: false,
    enableDashboardShareDialogLink: false,
    productionFeatures: undefined,
    enableNewScheduledExport: false,
    enableSeamlessIdpSwitch: false,
    enablePreAggregationDatasets: false,
    enableToDateFilters: true,
    enableCyclicalToDateFilters: true,
    enableNewPivotTable: false,
    enableNewGeoPushpin: false,
    enableAutomationManagement: true,
    enableNewPdfTabularExport: false,
    enableFilterAccessibility: false,
    enableGenAIMemory: false,
    aiChatSearchLimit: undefined,
    enableDashboardTabs: false,
    enablePivotTableAutoSizeReset: false,
    enablePreserveFilterSelectionDuringInit: false,
};

export const FeatureFlagsValues = {
    dashboardEditModeDevRollout: [true, false] as const,
    enableMetricSqlAndDataExplain: [true, false] as const,
    enableDescriptions: [true, false] as const,
    enableKPIDashboardExportPDF: [true, false] as const,
    enableSqlDatasets: [true, false] as const,
    enableFunnelChart: [true, false] as const,
    enablePyramidChart: [true, false] as const,
    enableSankeyChart: [true, false] as const,
    enableDependencyWheelChart: [true, false] as const,
    enableWaterfallChart: [true, false] as const,
    enableCompositeGrain: [true, false] as const,
    enableTableTotalRows: [true, false] as const,
    enablePivotTableIncreaseBucketSize: [true, false] as const,
    enableUserManagement: [true, false] as const,
    enableKDSavedFilters: [true, false] as const,
    enableClickHouseDataSource: [true, false] as const,
    enableKDCrossFiltering: [true, false] as const,
    enableChangeAnalysis: [true, false] as const,
    enableMultipleDateFilters: [true, false] as const,
    enableKDRichText: [true, false] as const,
    enableMySqlDataSource: [true, false] as const,
    enableMotherDuckDataSource: [true, false] as const,
    enableMongoDbDataSource: [true, false] as const,
    enableCreateUser: [true, false] as const,
    enableMariaDbDataSource: [true, false] as const,
    enableRepeaterChart: [true, false] as const,
    enableKDAttributeFilterDatesValidation: [true, false] as const,
    enableOracleDataSource: [true, false] as const,
    enableAnalyticalCatalog: [true, false] as const,
    enableAlerting: [true, false] as const,
    enableAlertAttributes: [true, false] as const,
    enableComparisonInAlerting: [true, false] as const,
    enableSmtp: [true, false] as const,
    enableScheduling: [true, false] as const,
    enableLabsSmartFunctions: [true, false] as const,
    enableSmartFunctions: [true, false] as const,
    enableKeyDriverAnalysis: [true, false] as const,
    enableDataProfiling: [true, false] as const,
    enableFlexAi: [true, false] as const,
    enableExperimentalFeaturesUI: [true, false] as const,
    enableSingleStoreDataSource: [true, false] as const,
    enableSnowflakeKeyPairAuthentication: [true, false] as const,
    enableMultipleDataSourcesInWorkspace: [true, false] as const,
    enableScatterPlotSegmentation: [true, false] as const,
    enableScatterPlotClustering: [true, false] as const,
    enableRichTextDescriptions: [true, false] as const,
    enableSchedulingRollout: [true, false] as const,
    enableWidgetIdentifiersRollout: [true, false] as const,
    enableAIFunctions: [true, false] as const,
    enableSemanticSearch: [true, false] as const,
    enableSemanticSearchRollout: [true, false] as const,
    enableGenAIChat: [true, false] as const,
    enableGenAIChatRollout: [true, false] as const,
    enableGenAICatalogQualityChecker: [false, true] as const,
    enableAlertingRollout: [true, false] as const,
    enableDashboardFilterViews: [true, false] as const,
    enableNewInsightChangedPostMessageEvent: [true, false] as const,
    enableKDVisualizationSwitcher: [true, false] as const,
    enableIgnoreCrossFiltering: [true, false] as const,
    enableHeadlineExport: [true, false] as const,
    earlyAccessFeatures: [undefined, {} as IEarlyAccessFeaturesConfig] as const,
    enableCrossFilteringAliasTitles: [true, false] as const,
    enableDefaultSmtp: [true, false] as const,
    enableNumberSeparators: [true, false] as const,
    enableNewUserCreationFlow: [true, false] as const,
    enableDestinationTesting: [true, false] as const,
    enableInPlatformNotifications: [true, false] as const,
    enableVisualizationFineTuning: [true, false] as const,
    enableExternalRecipients: [true, false] as const,
    enableDashboardTabularExport: [true, false] as const,
    enableOrchestratedTabularExports: [true, false] as const,
    enableDrilledTooltip: [true, false] as const,
    enableDashboardDescriptionDynamicHeight: [true, false] as const,
    enableAmplitudeTracker: [true, false] as const,
    enableSlideshowExports: [true, false] as const,
    enableRawExports: [true, false] as const,
    enableHighchartsAccessibility: [true, false] as const,
    enableChartAccessibilityFeatures: [true, false] as const,
    enableAccessibleChartTooltip: [true, false] as const,
    enableDashboardFiltersApplyModes: [true, false] as const,
    enableExecutionCancelling: [true, false] as const,
    enableImmediateAttributeFilterDisplayAsLabelMigration: [true, false] as const,
    enableRichTextDynamicReferences: [true, false] as const,
    enableAnalyticalDesignerCatalogSideload: [true, false] as const,
    enableDashboardShareLink: [true, false] as const,
    enableExecutionTimestamp: [true, false] as const,
    enableAutomationFilterContext: [true, false] as const,
    enableDateFilterIdentifiersRollout: [true, false] as const,
    enableAlertsEvaluationFrequencySetup: [true, false] as const,
    enableRichTooManyDatapointsErrors: [true, false] as const,
    enableLineChartTrendThreshold: [true, false] as const,
    enableKDRespectLegendPosition: [true, false] as const,
    enableWorkspaceSettingsAppHeaderMenuItem: [true, false] as const,
    enableSnapshotExportAccessibility: [true, false] as const,
    enableWidgetExportPngImage: [true, false] as const,
    enableExportToDocumentStorage: [true, false] as const,
    enableAttributeFilterVirtualised: [true, false] as const,
    enableNotificationChannelIdentifiers: [true, false] as const,
    enableDashboardShareDialogLink: [true, false] as const,
    productionFeatures: [undefined, {} as IProductionFeaturesConfig] as const,
    enableNewScheduledExport: [true, false] as const,
    enableSeamlessIdpSwitch: [true, false] as const,
    enablePreAggregationDatasets: [true, false] as const,
    enableToDateFilters: [true, false] as const,
    enableCyclicalToDateFilters: [true, false] as const,
    enableNewPivotTable: [true, false] as const,
    enableNewGeoPushpin: [true, false] as const,
    enableAutomationManagement: [true, false] as const,
    enableNewPdfTabularExport: [true, false] as const,
    enableFilterAccessibility: [false, true] as const,
    enableGenAIMemory: [false, true] as const,
    aiChatSearchLimit: [undefined, {} as number] as const,
    enableDashboardTabs: [true, false] as const,
    enablePivotTableAutoSizeReset: [true, false] as const,
    enablePreserveFilterSelectionDuringInit: [true, false] as const,
};
