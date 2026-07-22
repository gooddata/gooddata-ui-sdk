// (C) 2020-2026 GoodData Corporation

import { type IEarlyAccessFeaturesConfig, type IProductionFeaturesConfig } from "@gooddata/sdk-model";

/**
 * This is list of feature flags managed on Panther by FeatureHub
 * and keeping their default values for non-managed env
 */

export enum TigerFeaturesNames {
    EnableMetricSqlAndDataExplain = "enableMetricSqlAndDataExplain",
    EnableMetricFormatOverrides = "enableMetricFormatOverrides",
    EnableColumnLevelPermissions = "enableColumnLevelPermissions",
    EnableSqlDatasets = "enableSqlDatasets",
    EnableHighchartsAccessibility = "enableHighchartsAccessibility",
    EnableAccessibleChartTooltip = "enableAccessibleChartTooltip",
    EnableChangeAnalysis = "enableChangeAnalysis",
    EnableRankingWithMvf = "enableRankingWithMvf",
    EnableRankingStrictLimit = "enableRankingStrictLimit",
    EnableImprovedRankingFilter = "enableImprovedRankingFilter",
    EnableMySqlDataSource = "enableMySqlDataSource",
    EnableMariaDbDataSource = "enableMariaDbDataSource",
    EnableOracleDataSource = "enableOracleDataSource",
    EnableAnalyticalCatalog = "enableAnalyticalCatalog",
    EnableParameters = "enableParameters",
    EnableAnalyticalCatalogMetricEditor = "enableAnalyticalCatalogMetricEditor",
    EnableStringParameters = "enableStringParameters",
    EnableCustomTooltip = "enableCustomTooltip",
    EnableMotherDuckDataSource = "enableMotherDuckDataSource",
    EnableMongoDbDataSource = "enableMongoDbDataSource",
    EnableStarrocksDataSource = "enableStarrocksDataSource",
    EnableLabsSmartFunctions = "enableLabsSmartFunctions",
    EnableDataProfiling = "enableDataProfiling",
    EnableExperimentalFeaturesUI = "enableExperimentalFeaturesUI",
    EnableSingleStoreDataSource = "enableSingleStoreDataSource",
    EnableOidcAuth = "enableOidcAuth",
    EnableSemanticSearch = "enableSemanticSearch",
    EnableCatalogSmartSearchResults = "enableCatalogSmartSearchResults",
    EnableGenAIChat = "enableGenAIChat",
    EnableGenAICatalogQualityChecker = "enableGenAICatalogQualityChecker",
    EnableCatalogTrendingObjects = "enableCatalogTrendingObjects",
    EnableCatalogLineage = "enableCatalogLineage",
    EnableCertification = "enableCertification",
    EnableAIDataSetting = "enableAIDataSetting",
    EnableSystemAccountFiltering = "enableSystemAccountFiltering",
    EnableNewInsightChangedPostMessageEvent = "enableNewInsightChangedPostMessageEvent",
    EarlyAccessFeatures = "earlyAccessFeatures",
    EnableDefaultSmtp = "enableDefaultSmtp",
    EnableVisualizationFilteringByTags = "enableVisualizationFilteringByTags",
    EnableVisualizationFineTuning = "enableVisualizationFineTuning",
    EnableDashboardDescriptionDynamicHeight = "enableDashboardDescriptionDynamicHeight",
    EnableAmplitudeTracker = "enableAmplitudeTracker",
    EnableExportTemplateSelection = "enableExportTemplateSelection",
    EnableExportTemplatesSettingUi = "enableExportTemplatesSettingUi",
    EnableRawExports = "enableRawExports",
    EnableExecutionCancelling = "enableExecutionCancelling",
    EnableDashboardTabularExport = "enableDashboardTabularExport",
    EnableOrchestratedTabularExports = "enableOrchestratedTabularExports",
    EnableImmediateAttributeFilterDisplayAsLabelMigration = "enableImmediateAttributeFilterDisplayAsLabelMigration",
    EnableAnalyticalDesignerCatalogSideload = "enableAnalyticalDesignerCatalogSideload",
    EnableWorkspaceSettingsAppHeaderMenuItem = "enableWorkspaceSettingsAppHeaderMenuItem",
    EnableSnapshotExportAccessibility = "enableSnapshotExportAccessibility",
    EnableExportToDocumentStorage = "enableExportToDocumentStorage",
    EnableNotificationChannelIdentifiers = "enableNotificationChannelIdentifiers",
    EnableDashboardShareDialogLink = "enableDashboardShareDialogLink",
    ProductionFeatures = "productionFeatures",
    EnableSeamlessIdpSwitch = "enableSeamlessIdpSwitch",
    EnablePreAggregationDatasets = "enablePreAggregationDatasets",
    EnableNewPivotTable = "enableNewPivotTable",
    EnableConditionalFormatting = "enableConditionalFormatting",
    EnableNewGeoPushpin = "enableNewGeoPushpin",
    EnableGeoArea = "enableGeoArea",
    EnableHLL = "enableHLL",
    EnableGeoPushpinIcon = "enableGeoPushpinIcon",
    EnableGeoChartA11yImprovements = "enableGeoChartA11yImprovements",
    EnableGeoLayersExport = "enableGeoLayersExport",
    EnableGeoChartsViewportConfig = "enableGeoChartsViewportConfig",
    EnableGeoSegmentConflictRecommendation = "enableGeoSegmentConflictRecommendation",
    EnableGeoBasemapConfig = "enableGeoBasemapConfig",
    EnableCustomGeoCollection = "enableCustomGeoCollection",
    EnableGeoSatelliteBasemapOption = "enableGeoSatelliteBasemapOption",
    EnableGenAIMemory = "enableGenAIMemory",
    EnableOrgLevelAIMemory = "enableOrgLevelAIMemory",
    EnableAIKnowledge = "enableAIKnowledge",
    EnableAiAgenticSuggestions = "enableAiAgenticSuggestions",
    EnableGenAIReasoningVisibility = "enableGenAIReasoningVisibility",
    EnableAiAgenticConversations = "enableAiAgenticConversations",
    EnableGenAiAgentSwitching = "enableGenAiAgentSwitching",
    EnableGenAiObservability = "enableGenAiObservability",
    EnableGenAiInteractionIntelligence = "enableGenAiInteractionIntelligence",
    EnableGenAiAgenticDataShareOptOut = "enableGenAiAgenticDataShareOptOut",
    EnableGenAiVisualizationSummarySkill = "enableGenAiVisualizationSummarySkill",
    EnableGenAiDashboardSummarySkill = "enableGenAiDashboardSummarySkill",
    AIChatSearchLimit = "aiChatSearchLimit",
    EnableRichTextWidgetFilterConfiguration = "enableRichTextWidgetFilterConfiguration",
    EnableDashboardSectionHeadersDateDataSet = "enableDashboardSectionHeadersDateDataSet",
    EnableAnalyticalDashboardVersion3 = "enableAnalyticalDashboardVersion3",
    EnableAnomalyDetectionAlert = "enableAnomalyDetectionAlert",
    EnableAnomalyDetectionVisualization = "enableAnomalyDetectionVisualization",
    EnableAlertOncePerInterval = "enableAlertOncePerInterval",
    EnableFiscalCalendars = "enableFiscalCalendars",
    EnableDashboardFilterGroups = "enableDashboardFilterGroups",
    EnableMatchFilterAD = "enableMatchFilterAD",
    EnableArbitraryFilterAD = "enableArbitraryFilterAD",
    EnableMatchFilterKD = "enableMatchFilterKD",
    EnableArbitraryFilterKD = "enableArbitraryFilterKD",
    EnableMeasureValueFilterKD = "enableMeasureValueFilterKD",
    EnableShellApplication = "enableShellApplication",
    EnableShellApplicationCatalog = "enableShellApplication_catalog",
    EnableShellApplicationDashboards = "enableShellApplication_dashboards",
    EnableNullableJoins = "enableNullableJoins",
    EnableDashboardDensitySetting = "enableDashboardDensitySetting",
    EnableDashboardsSearch = "enableDashboardsSearch",
    EnableAiHub = "enableAiHub",
    EnableAutomationTrigger = "enableAutomationTrigger",
    EnableUserDataFiltersUi = "enableUserDataFiltersUi",
    EnableEnhancedInsightPicker = "enableEnhancedInsightPicker",
    EnableAiAgenticMultiConversations = "enableAiAgenticMultiConversations",
    EnableAiLlmAnthropicProvider = "enableAiLlmAnthropicProvider",
    EnableRadarChart = "enableRadarChart",
    EnableMekkoChart = "enableMekkoChart",
    EnableAnalyticalDesignerRemoteModule = "enableShellApplication_analyticalDesigner",
    EnableDashboardSidebarResize = "enableDashboardSidebarResize",
    EnableExportTimeoutFix = "enableExportTimeoutFix",
    EnableAiAssistantEmbedding = "enableAiAssistantEmbedding",
    EnableAiContextSetup = "enableAiContextSetup",
    EnableDashboardPersistentFiltersAcrossTabs = "enableDashboardPersistentFiltersAcrossTabs",
}

export type ITigerFeatureFlags = {
    enableMetricSqlAndDataExplain: (typeof FeatureFlagsValues)["enableMetricSqlAndDataExplain"][number];
    enableMetricFormatOverrides: (typeof FeatureFlagsValues)["enableMetricFormatOverrides"][number];
    enableColumnLevelPermissions: (typeof FeatureFlagsValues)["enableColumnLevelPermissions"][number];
    enableSqlDatasets: (typeof FeatureFlagsValues)["enableSqlDatasets"][number];
    enableRadarChart: (typeof FeatureFlagsValues)["enableRadarChart"][number];
    enableMekkoChart: (typeof FeatureFlagsValues)["enableMekkoChart"][number];
    enableChangeAnalysis: (typeof FeatureFlagsValues)["enableChangeAnalysis"][number];
    enableRankingWithMvf: (typeof FeatureFlagsValues)["enableRankingWithMvf"][number];
    enableRankingStrictLimit: (typeof FeatureFlagsValues)["enableRankingStrictLimit"][number];
    enableImprovedRankingFilter: (typeof FeatureFlagsValues)["enableImprovedRankingFilter"][number];
    enableMySqlDataSource: (typeof FeatureFlagsValues)["enableMySqlDataSource"][number];
    enableMariaDbDataSource: (typeof FeatureFlagsValues)["enableMariaDbDataSource"][number];
    enableOracleDataSource: (typeof FeatureFlagsValues)["enableOracleDataSource"][number];
    enableAnalyticalCatalog: (typeof FeatureFlagsValues)["enableAnalyticalCatalog"][number];
    enableParameters: (typeof FeatureFlagsValues)["enableParameters"][number];
    enableAnalyticalCatalogMetricEditor: (typeof FeatureFlagsValues)["enableAnalyticalCatalogMetricEditor"][number];
    enableStringParameters: (typeof FeatureFlagsValues)["enableStringParameters"][number];
    enableLabsSmartFunctions: (typeof FeatureFlagsValues)["enableLabsSmartFunctions"][number];
    enableCustomTooltip: (typeof FeatureFlagsValues)["enableCustomTooltip"][number];
    enableMotherDuckDataSource: (typeof FeatureFlagsValues)["enableMotherDuckDataSource"][number];
    enableMongoDbDataSource: (typeof FeatureFlagsValues)["enableMongoDbDataSource"][number];
    enableStarrocksDataSource: (typeof FeatureFlagsValues)["enableStarrocksDataSource"][number];
    enableDataProfiling: (typeof FeatureFlagsValues)["enableDataProfiling"][number];
    enableExperimentalFeaturesUI: (typeof FeatureFlagsValues)["enableExperimentalFeaturesUI"][number];
    enableSingleStoreDataSource: (typeof FeatureFlagsValues)["enableSingleStoreDataSource"][number];
    enableOidcAuth: (typeof FeatureFlagsValues)["enableOidcAuth"][number];
    enableSemanticSearch: (typeof FeatureFlagsValues)["enableSemanticSearch"][number];
    enableCatalogSmartSearchResults: (typeof FeatureFlagsValues)["enableCatalogSmartSearchResults"][number];
    enableGenAIChat: (typeof FeatureFlagsValues)["enableGenAIChat"][number];
    enableGenAICatalogQualityChecker: (typeof FeatureFlagsValues)["enableGenAICatalogQualityChecker"][number];
    enableCatalogTrendingObjects: (typeof FeatureFlagsValues)["enableCatalogTrendingObjects"][number];
    enableCatalogLineage: (typeof FeatureFlagsValues)["enableCatalogLineage"][number];
    enableCertification: (typeof FeatureFlagsValues)["enableCertification"][number];
    enableAIDataSetting: (typeof FeatureFlagsValues)["enableAIDataSetting"][number];
    enableSystemAccountFiltering: (typeof FeatureFlagsValues)["enableSystemAccountFiltering"][number];
    enableNewInsightChangedPostMessageEvent: (typeof FeatureFlagsValues)["enableNewInsightChangedPostMessageEvent"][number];
    earlyAccessFeatures: (typeof FeatureFlagsValues)["earlyAccessFeatures"][number];
    enableDefaultSmtp: (typeof FeatureFlagsValues)["enableDefaultSmtp"][number];
    enableVisualizationFilteringByTags: (typeof FeatureFlagsValues)["enableVisualizationFilteringByTags"][number];
    enableVisualizationFineTuning: (typeof FeatureFlagsValues)["enableVisualizationFineTuning"][number];
    enableDashboardTabularExport: (typeof FeatureFlagsValues)["enableDashboardTabularExport"][number];
    enableOrchestratedTabularExports: (typeof FeatureFlagsValues)["enableOrchestratedTabularExports"][number];
    enableDashboardDescriptionDynamicHeight: (typeof FeatureFlagsValues)["enableDashboardDescriptionDynamicHeight"][number];
    enableAmplitudeTracker: (typeof FeatureFlagsValues)["enableAmplitudeTracker"][number];
    enableExportTemplateSelection: (typeof FeatureFlagsValues)["enableExportTemplateSelection"][number];
    enableExportTemplatesSettingUi: (typeof FeatureFlagsValues)["enableExportTemplatesSettingUi"][number];
    enableRawExports: (typeof FeatureFlagsValues)["enableRawExports"][number];
    enableExecutionCancelling: (typeof FeatureFlagsValues)["enableExecutionCancelling"][number];
    enableImmediateAttributeFilterDisplayAsLabelMigration: (typeof FeatureFlagsValues)["enableImmediateAttributeFilterDisplayAsLabelMigration"][number];
    enableAnalyticalDesignerCatalogSideload: (typeof FeatureFlagsValues)["enableAnalyticalDesignerCatalogSideload"][number];
    enableHighchartsAccessibility: (typeof FeatureFlagsValues)["enableHighchartsAccessibility"][number];
    enableAccessibleChartTooltip: (typeof FeatureFlagsValues)["enableAccessibleChartTooltip"][number];
    enableWorkspaceSettingsAppHeaderMenuItem: (typeof FeatureFlagsValues)["enableWorkspaceSettingsAppHeaderMenuItem"][number];
    enableSnapshotExportAccessibility: (typeof FeatureFlagsValues)["enableSnapshotExportAccessibility"][number];
    enableExportToDocumentStorage: (typeof FeatureFlagsValues)["enableExportToDocumentStorage"][number];
    enableNotificationChannelIdentifiers: (typeof FeatureFlagsValues)["enableNotificationChannelIdentifiers"][number];
    enableDashboardShareDialogLink: (typeof FeatureFlagsValues)["enableDashboardShareDialogLink"][number];
    productionFeatures: (typeof FeatureFlagsValues)["productionFeatures"][number];
    enableSeamlessIdpSwitch: (typeof FeatureFlagsValues)["enableSeamlessIdpSwitch"][number];
    enablePreAggregationDatasets: (typeof FeatureFlagsValues)["enablePreAggregationDatasets"][number];
    enableNewPivotTable: (typeof FeatureFlagsValues)["enableNewPivotTable"][number];
    enableConditionalFormatting: (typeof FeatureFlagsValues)["enableConditionalFormatting"][number];
    enableNewGeoPushpin: (typeof FeatureFlagsValues)["enableNewGeoPushpin"][number];
    enableGeoArea: (typeof FeatureFlagsValues)["enableGeoArea"][number];
    enableHLL: (typeof FeatureFlagsValues)["enableHLL"][number];
    enableGeoPushpinIcon: (typeof FeatureFlagsValues)["enableGeoPushpinIcon"][number];
    enableGeoChartA11yImprovements: (typeof FeatureFlagsValues)["enableGeoChartA11yImprovements"][number];
    enableGeoLayersExport: (typeof FeatureFlagsValues)["enableGeoLayersExport"][number];
    enableGeoChartsViewportConfig: (typeof FeatureFlagsValues)["enableGeoChartsViewportConfig"][number];
    enableGeoSegmentConflictRecommendation: (typeof FeatureFlagsValues)["enableGeoSegmentConflictRecommendation"][number];
    enableGeoBasemapConfig: (typeof FeatureFlagsValues)["enableGeoBasemapConfig"][number];
    enableCustomGeoCollection: (typeof FeatureFlagsValues)["enableCustomGeoCollection"][number];
    enableGeoSatelliteBasemapOption: (typeof FeatureFlagsValues)["enableGeoSatelliteBasemapOption"][number];
    enableGenAIMemory: (typeof FeatureFlagsValues)["enableGenAIMemory"][number];
    enableOrgLevelAIMemory: (typeof FeatureFlagsValues)["enableOrgLevelAIMemory"][number];
    enableAIKnowledge: (typeof FeatureFlagsValues)["enableAIKnowledge"][number];
    enableAiAgenticSuggestions: (typeof FeatureFlagsValues)["enableAiAgenticSuggestions"][number];
    enableAiAssistantEmbedding: (typeof FeatureFlagsValues)["enableAiAssistantEmbedding"][number];
    enableAiAgenticMultiConversations: (typeof FeatureFlagsValues)["enableAiAgenticMultiConversations"][number];
    enableGenAiAgentSwitching: (typeof FeatureFlagsValues)["enableGenAiAgentSwitching"][number];
    enableGenAiObservability: (typeof FeatureFlagsValues)["enableGenAiObservability"][number];
    enableGenAiInteractionIntelligence: (typeof FeatureFlagsValues)["enableGenAiInteractionIntelligence"][number];
    enableGenAIReasoningVisibility: (typeof FeatureFlagsValues)["enableGenAIReasoningVisibility"][number];
    aiChatSearchLimit: (typeof FeatureFlagsValues)["aiChatSearchLimit"][number];
    enableRichTextWidgetFilterConfiguration: (typeof FeatureFlagsValues)["enableRichTextWidgetFilterConfiguration"][number];
    enableDashboardSectionHeadersDateDataSet: (typeof FeatureFlagsValues)["enableDashboardSectionHeadersDateDataSet"][number];
    enableAnalyticalDashboardVersion3: (typeof FeatureFlagsValues)["enableAnalyticalDashboardVersion3"][number];
    enableAnomalyDetectionAlert: (typeof FeatureFlagsValues)["enableAnomalyDetectionAlert"][number];
    enableAnomalyDetectionVisualization: (typeof FeatureFlagsValues)["enableAnomalyDetectionVisualization"][number];
    enableAlertOncePerInterval: (typeof FeatureFlagsValues)["enableAlertOncePerInterval"][number];
    enableFiscalCalendars: (typeof FeatureFlagsValues)["enableFiscalCalendars"][number];
    enableDashboardFilterGroups: (typeof FeatureFlagsValues)["enableDashboardFilterGroups"][number];
    enableMatchFilterAD: (typeof FeatureFlagsValues)["enableMatchFilterAD"][number];
    enableArbitraryFilterAD: (typeof FeatureFlagsValues)["enableArbitraryFilterAD"][number];
    enableMatchFilterKD: (typeof FeatureFlagsValues)["enableMatchFilterKD"][number];
    enableArbitraryFilterKD: (typeof FeatureFlagsValues)["enableArbitraryFilterKD"][number];
    enableMeasureValueFilterKD: (typeof FeatureFlagsValues)["enableMeasureValueFilterKD"][number];
    enableShellApplication: (typeof FeatureFlagsValues)["enableShellApplication"][number];
    enableShellApplication_catalog: (typeof FeatureFlagsValues)["enableShellApplication_catalog"][number];
    enableShellApplication_dashboards: (typeof FeatureFlagsValues)["enableShellApplication_dashboards"][number];
    enableNullableJoins: (typeof FeatureFlagsValues)["enableNullableJoins"][number];
    enableDashboardDensitySetting: (typeof FeatureFlagsValues)["enableDashboardDensitySetting"][number];
    enableDashboardsSearch: (typeof FeatureFlagsValues)["enableDashboardsSearch"][number];
    enableAiHub: (typeof FeatureFlagsValues)["enableAiHub"][number];
    enableAiAgenticConversations: (typeof FeatureFlagsValues)["enableAiAgenticConversations"][number];
    enableAiContextSetup: (typeof FeatureFlagsValues)["enableAiContextSetup"][number];
    enableGenAiAgenticDataShareOptOut: (typeof FeatureFlagsValues)["enableGenAiAgenticDataShareOptOut"][number];
    enableGenAiVisualizationSummarySkill: (typeof FeatureFlagsValues)["enableGenAiVisualizationSummarySkill"][number];
    enableGenAiDashboardSummarySkill: (typeof FeatureFlagsValues)["enableGenAiDashboardSummarySkill"][number];
    enableAutomationTrigger: (typeof FeatureFlagsValues)["enableAutomationTrigger"][number];
    enableUserDataFiltersUi: (typeof FeatureFlagsValues)["enableUserDataFiltersUi"][number];
    enableEnhancedInsightPicker: (typeof FeatureFlagsValues)["enableEnhancedInsightPicker"][number];
    enableAiLlmAnthropicProvider: (typeof FeatureFlagsValues)["enableAiLlmAnthropicProvider"][number];
    enableShellApplication_analyticalDesigner: (typeof FeatureFlagsValues)["enableShellApplication_analyticalDesigner"][number];
    enableDashboardSidebarResize: (typeof FeatureFlagsValues)["enableDashboardSidebarResize"][number];
    enableExportTimeoutFix: (typeof FeatureFlagsValues)["enableExportTimeoutFix"][number];
    enableDashboardPersistentFiltersAcrossTabs: (typeof FeatureFlagsValues)["enableDashboardPersistentFiltersAcrossTabs"][number];
};

export const DefaultFeatureFlags: ITigerFeatureFlags = {
    enableMetricSqlAndDataExplain: false,
    enableMetricFormatOverrides: false,
    enableColumnLevelPermissions: false,
    enableSqlDatasets: false,
    enableRadarChart: false,
    enableMekkoChart: false,
    enableChangeAnalysis: false,
    enableRankingWithMvf: false,
    enableRankingStrictLimit: true,
    enableImprovedRankingFilter: true,
    enableMySqlDataSource: false,
    enableMariaDbDataSource: false,
    enableMotherDuckDataSource: false,
    enableMongoDbDataSource: true,
    enableStarrocksDataSource: false,
    enableOracleDataSource: false,
    enableAnalyticalCatalog: false,
    enableParameters: true,
    enableAnalyticalCatalogMetricEditor: false,
    enableStringParameters: false,
    enableLabsSmartFunctions: false,
    enableCustomTooltip: true,
    enableDataProfiling: false,
    enableExperimentalFeaturesUI: false,
    enableSingleStoreDataSource: false,
    enableOidcAuth: false,
    enableSemanticSearch: false,
    enableCatalogSmartSearchResults: true,
    enableGenAIChat: false,
    enableGenAICatalogQualityChecker: false,
    enableCatalogTrendingObjects: false,
    enableCatalogLineage: false,
    enableCertification: false,
    enableAIDataSetting: false,
    enableSystemAccountFiltering: true,
    enableNewInsightChangedPostMessageEvent: false,
    earlyAccessFeatures: undefined,
    enableDefaultSmtp: false,
    enableVisualizationFilteringByTags: false,
    enableVisualizationFineTuning: false,
    enableDashboardTabularExport: false,
    enableOrchestratedTabularExports: false,
    enableDashboardDescriptionDynamicHeight: false,
    enableAmplitudeTracker: false,
    enableExportTemplateSelection: true,
    enableExportTemplatesSettingUi: false,
    enableRawExports: false,
    enableExecutionCancelling: false,
    enableImmediateAttributeFilterDisplayAsLabelMigration: false,
    enableAnalyticalDesignerCatalogSideload: false,
    enableHighchartsAccessibility: true,
    enableAccessibleChartTooltip: false,
    enableWorkspaceSettingsAppHeaderMenuItem: false,
    enableSnapshotExportAccessibility: false,
    enableExportToDocumentStorage: false,
    enableNotificationChannelIdentifiers: false,
    enableDashboardShareDialogLink: false,
    productionFeatures: undefined,
    enableSeamlessIdpSwitch: false,
    enablePreAggregationDatasets: false,
    enableNewPivotTable: true,
    enableConditionalFormatting: false,
    enableNewGeoPushpin: true,
    enableGeoArea: true,
    enableHLL: false,
    enableGeoPushpinIcon: true,
    enableGeoChartA11yImprovements: true,
    enableGeoLayersExport: false,
    enableGeoChartsViewportConfig: true,
    enableGeoSegmentConflictRecommendation: true,
    enableGeoBasemapConfig: true,
    enableCustomGeoCollection: true,
    enableGeoSatelliteBasemapOption: false,
    enableGenAIMemory: false,
    enableOrgLevelAIMemory: false,
    enableAIKnowledge: false,
    enableAiAgenticSuggestions: false,
    enableAiAssistantEmbedding: false,
    enableAiAgenticMultiConversations: false,
    enableGenAiAgentSwitching: false,
    enableGenAiObservability: false,
    enableGenAiInteractionIntelligence: false,
    enableGenAIReasoningVisibility: false,
    aiChatSearchLimit: undefined,
    enableRichTextWidgetFilterConfiguration: false,
    enableDashboardSectionHeadersDateDataSet: false,
    enableAnalyticalDashboardVersion3: false,
    enableAnomalyDetectionAlert: false,
    enableAnomalyDetectionVisualization: true,
    enableAlertOncePerInterval: false,
    enableFiscalCalendars: true,
    enableDashboardFilterGroups: true,
    enableMatchFilterAD: true,
    enableArbitraryFilterAD: true,
    enableMatchFilterKD: true,
    enableArbitraryFilterKD: true,
    enableMeasureValueFilterKD: true,
    enableShellApplication: true,
    enableShellApplication_catalog: false,
    enableShellApplication_dashboards: false,
    enableNullableJoins: false,
    enableDashboardDensitySetting: false,
    enableDashboardsSearch: false,
    enableAiHub: false,
    enableAiAgenticConversations: false,
    enableAiContextSetup: false,
    enableGenAiAgenticDataShareOptOut: false,
    enableGenAiVisualizationSummarySkill: false,
    enableGenAiDashboardSummarySkill: false,
    enableAutomationTrigger: false,
    enableUserDataFiltersUi: false,
    enableEnhancedInsightPicker: false,
    enableAiLlmAnthropicProvider: false,
    enableShellApplication_analyticalDesigner: false,
    enableDashboardSidebarResize: true,
    enableExportTimeoutFix: false,
    enableDashboardPersistentFiltersAcrossTabs: false,
};

export const FeatureFlagsValues = {
    enableMetricSqlAndDataExplain: [true, false] as const,
    enableMetricFormatOverrides: [true, false] as const,
    enableColumnLevelPermissions: [true, false] as const,
    enableSqlDatasets: [true, false] as const,
    enableRadarChart: [true, false] as const,
    enableMekkoChart: [true, false] as const,
    enableChangeAnalysis: [true, false] as const,
    enableRankingWithMvf: [true, false] as const,
    enableRankingStrictLimit: [true, false] as const,
    enableImprovedRankingFilter: [true, false] as const,
    enableMySqlDataSource: [true, false] as const,
    enableMotherDuckDataSource: [true, false] as const,
    enableMongoDbDataSource: [true, false] as const,
    enableStarrocksDataSource: [true, false] as const,
    enableMariaDbDataSource: [true, false] as const,
    enableOracleDataSource: [true, false] as const,
    enableAnalyticalCatalog: [true, false] as const,
    enableParameters: [true, false] as const,
    enableAnalyticalCatalogMetricEditor: [true, false] as const,
    enableStringParameters: [true, false] as const,
    enableLabsSmartFunctions: [true, false] as const,
    enableCustomTooltip: [true, false] as const,
    enableDataProfiling: [true, false] as const,
    enableExperimentalFeaturesUI: [true, false] as const,
    enableSingleStoreDataSource: [true, false] as const,
    enableOidcAuth: [true, false] as const,
    enableSemanticSearch: [true, false] as const,
    enableCatalogSmartSearchResults: [true, false] as const,
    enableGenAIChat: [true, false] as const,
    enableGenAICatalogQualityChecker: [false, true] as const,
    enableCatalogTrendingObjects: [true, false] as const,
    enableCatalogLineage: [false, true] as const,
    enableCertification: [true, false] as const,
    enableAIDataSetting: [true, false] as const,
    enableSystemAccountFiltering: [true, false] as const,
    enableNewInsightChangedPostMessageEvent: [true, false] as const,
    earlyAccessFeatures: [undefined, {} as IEarlyAccessFeaturesConfig] as const,
    enableDefaultSmtp: [true, false] as const,
    enableVisualizationFilteringByTags: [true, false] as const,
    enableVisualizationFineTuning: [true, false] as const,
    enableDashboardTabularExport: [true, false] as const,
    enableOrchestratedTabularExports: [true, false] as const,
    enableDashboardDescriptionDynamicHeight: [true, false] as const,
    enableAmplitudeTracker: [true, false] as const,
    enableExportTemplateSelection: [true, false] as const,
    enableExportTemplatesSettingUi: [true, false] as const,
    enableRawExports: [true, false] as const,
    enableHighchartsAccessibility: [true, false] as const,
    enableAccessibleChartTooltip: [true, false] as const,
    enableExecutionCancelling: [true, false] as const,
    enableImmediateAttributeFilterDisplayAsLabelMigration: [true, false] as const,
    enableAnalyticalDesignerCatalogSideload: [true, false] as const,
    enableWorkspaceSettingsAppHeaderMenuItem: [true, false] as const,
    enableSnapshotExportAccessibility: [true, false] as const,
    enableExportToDocumentStorage: [true, false] as const,
    enableNotificationChannelIdentifiers: [true, false] as const,
    enableDashboardShareDialogLink: [true, false] as const,
    productionFeatures: [undefined, {} as IProductionFeaturesConfig] as const,
    enableSeamlessIdpSwitch: [true, false] as const,
    enablePreAggregationDatasets: [true, false] as const,
    enableNewPivotTable: [true, false] as const,
    enableConditionalFormatting: [true, false] as const,
    enableNewGeoPushpin: [true, false] as const,
    enableGeoArea: [true, false] as const,
    enableHLL: [true, false] as const,
    enableGeoPushpinIcon: [true, false] as const,
    enableGeoChartA11yImprovements: [true, false] as const,
    enableGeoLayersExport: [true, false] as const,
    enableGeoChartsViewportConfig: [true, false] as const,
    enableGeoSegmentConflictRecommendation: [true, false] as const,
    enableGeoBasemapConfig: [true, false] as const,
    enableCustomGeoCollection: [true, false] as const,
    enableGeoSatelliteBasemapOption: [true, false] as const,
    enableGenAIMemory: [false, true] as const,
    enableOrgLevelAIMemory: [false, true] as const,
    enableAIKnowledge: [false, true] as const,
    enableAiAgenticSuggestions: [true, false] as const,
    enableAiAssistantEmbedding: [true, false] as const,
    enableAiAgenticMultiConversations: [true, false] as const,
    enableGenAiAgentSwitching: [true, false] as const,
    enableGenAiObservability: [true, false] as const,
    enableGenAiInteractionIntelligence: [true, false] as const,
    enableGenAIReasoningVisibility: [false, true] as const,
    aiChatSearchLimit: [undefined, {} as number] as const,
    enableRichTextWidgetFilterConfiguration: [true, false] as const,
    enableDashboardSectionHeadersDateDataSet: [true, false] as const,
    enableAnalyticalDashboardVersion3: [true, false] as const,
    enableAnomalyDetectionAlert: [true, false] as const,
    enableAnomalyDetectionVisualization: [true, false] as const,
    enableAlertOncePerInterval: [true, false] as const,
    enableFiscalCalendars: [true, false] as const,
    enableDashboardFilterGroups: [true, false] as const,
    enableMatchFilterAD: [true, false] as const,
    enableArbitraryFilterAD: [true, false] as const,
    enableMatchFilterKD: [true, false] as const,
    enableArbitraryFilterKD: [true, false] as const,
    enableMeasureValueFilterKD: [false, true] as const,
    enableShellApplication: [true, false] as const,
    enableShellApplication_catalog: [false, true] as const,
    enableShellApplication_dashboards: [false, true] as const,
    enableNullableJoins: [true, false] as const,
    enableDashboardDensitySetting: [true, false] as const,
    enableDashboardsSearch: [false, true] as const,
    enableAiHub: [true, false] as const,
    enableAiAgenticConversations: [true, false] as const,
    enableAiContextSetup: [true, false] as const,
    enableGenAiAgenticDataShareOptOut: [true, false] as const,
    enableGenAiVisualizationSummarySkill: [false, true] as const,
    enableGenAiDashboardSummarySkill: [false, true] as const,
    enableAutomationTrigger: [true, false] as const,
    enableUserDataFiltersUi: [true, false] as const,
    enableEnhancedInsightPicker: [true, false] as const,
    enableAiLlmAnthropicProvider: [true, false] as const,
    enableShellApplication_analyticalDesigner: [true, false] as const,
    enableDashboardSidebarResize: [true, false] as const,
    enableExportTimeoutFix: [true, false] as const,
    enableDashboardPersistentFiltersAcrossTabs: [true, false] as const,
};
