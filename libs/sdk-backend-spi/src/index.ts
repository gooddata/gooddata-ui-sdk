// (C) 2019-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

/**
 * This package provides definitions of the Service Provider Interface (SPI) for the Analytical Backend.
 *
 * @remarks
 * The interface defines functionality to be implemented for a particular backend to be used in GoodData.UI.
 * The Analytical Backend SPI for GoodData Cloud and GoodData.CN (joint codename `tiger` in `@gooddata/sdk-backend-tiger`) is almost fully implemented.
 *
 * @packageDocumentation
 */
export {
    type IAnalyticalBackend,
    type IAnalyticalBackendConfig,
    type AnalyticalBackendFactory,
    type IAuthenticationContext,
    type IAuthenticatedPrincipal,
    type IAuthenticationProvider,
    type NotAuthenticatedHandler,
    type IRequestCorrelationMetadata,
    prepareExecution,
} from "./backend/index.js";

export type { IBackendCapabilities } from "./backend/capabilities.js";

export type { IUserSettings, IWorkspaceSettings, IUserWorkspaceSettings } from "./common/settings.js";

export type { IUserService } from "./user/index.js";
export type { IUserSettingsService } from "./user/settings/index.js";

export type {
    IPreparedExecutionOptions,
    IExecutionContext,
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    IForecastView,
    ExplainConfig,
    IExplainResult,
    IExplainProvider,
    ExplainType,
    IForecastResult,
    IForecastConfig,
    IAnomalyDetectionConfig,
    IAnomalyDetectionResult,
    IClusteringConfig,
    IClusteringResult,
    ICollectionItemsConfig,
    ICollectionItemsResult,
    IExecutionResultMetadata,
    IExecutionResultDataSourceMessage,
    IOutliersView,
    IOutliersConfig,
    IOutliersResult,
} from "./workspace/execution/index.js";

export type { IWorkspaceSettingsService } from "./workspace/settings/index.js";

export type { CancelableOptions, ICancelable } from "./cancelation/index.js";

export type {
    IGetInsightOptions,
    IGetVisualizationClassesOptions,
    IWorkspaceInsightsService,
    InsightOrdering,
    IInsightsQueryOptions,
    IInsightsQuery,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    InsightReferenceTypes,
    SupportedInsightReferenceTypes,
} from "./workspace/insights/index.js";

export type {
    ExportDefinitionOrdering,
    IExportDefinitionsQuery,
    IExportDefinitionsQueryOptions,
    IExportDefinitionsQueryResult,
    IGetExportDefinitionOptions,
    IWorkspaceExportDefinitionsService,
    ExportDefinitionQuerySortDirection,
    ExportDefinitionQuerySortProperty,
    ExportDefinitionQuerySort,
} from "./workspace/exportDefinitions/index.js";

export {
    type IElementsQueryFactory,
    type IElementsQueryResult,
    type IElementsQuery,
    type IElementsQueryOptions,
    type IElementsQueryAttributeFilter,
    type IElementsQueryOptionsElementsByUri,
    type IElementsQueryOptionsElementsByValue,
    type IElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    type ElementsQueryOptionsElementsSpecification,
    type IFilterElementsQuery,
    type FilterWithResolvableElements,
    isElementsQueryOptionsElementsByValue,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isValueBasedElementsQueryOptionsElements,
} from "./workspace/attributes/elements/index.js";

export type { IExportConfig, IExportResult, IExportPdfConfig } from "./workspace/execution/export.js";

export type {
    IGenAIService,
    IAnalyticsCatalogService,
    IAnalyticsCatalogTags,
    IAnalyticsCatalogCreatedBy,
    ISemanticSearchQuery,
    ISemanticSearchResult,
    IChatThread,
    IChatThreadHistory,
    IChatThreadQuery,
    IGenAIChatEvaluation,
    ISemanticQualityService,
    IMemoryItemsService,
    IMemoryCreatedByUsers,
    IMemoryItemsQuery,
    IMemoryItemsFilterOptions,
    IMemoryItemsQueryResult,
} from "./workspace/genAI/index.js";

export type { IWorkspaceStylingService } from "./workspace/styling/index.js";
export {
    type AuthenticationFlow,
    type IDataTooLargeResponseBody,
    type IDataTooLargeResponseBodyLimitBreak,
    type IDataTooLargeResponseBodyStructuredDetail,
    type ErrorConverter,
    type NotAuthenticatedReason,
    AnalyticalBackendError,
    NoDataError,
    DataTooLargeError,
    TimeoutError,
    ProtectedDataError,
    UnexpectedResponseError,
    UnexpectedError,
    NotSupported,
    NotImplemented,
    NotAuthenticated,
    LimitReached,
    ContractExpired,
    AbortError,
    isAnalyticalBackendError,
    isNoDataError,
    isDataTooLargeError,
    isProtectedDataError,
    isUnexpectedResponseError,
    isUnexpectedError,
    isNotSupported,
    isNotImplemented,
    isNotAuthenticated,
    isLimitReached,
    isContractExpired,
    AnalyticalBackendErrorTypes,
    isAbortError,
} from "./errors/index.js";

export type { IPagedResource } from "./common/paging.js";
export type { IFilterBaseOptions } from "./common/filtering.js";
export type { QueryMethod } from "./common/query.js";

export type {
    IAnalyticalWorkspace,
    IWorkspacesQuery,
    IWorkspacesQueryFactory,
    IWorkspacesQueryResult,
    IWorkspacesQueryFilter,
    IWorkspacesQueryOptions,
    IWorkspaceDescriptor,
    IWorkspaceDescriptorUpdate,
} from "./workspace/index.js";

export type { IAttributeHierarchiesService } from "./workspace/attributeHierarchies/index.js";

export type { IWorkspacePermissionsService } from "./workspace/permissions/index.js";

export type {
    IWorkspaceAttributesService,
    IAttributeWithReferences,
    IAttributesQuery,
    IAttributesQueryFilterOptions,
    IAttributesQueryResult,
} from "./workspace/attributes/index.js";

export type {
    IWorkspaceMeasuresService,
    IGetMeasureOptions,
    IMeasureReferencing,
    IMeasureKeyDrivers,
    IMeasuresQueryResult,
    IMeasuresQuery,
} from "./workspace/measures/index.js";

export type { IWorkspaceFactsService, IFactsQuery, IFactsQueryResult } from "./workspace/facts/index.js";

export type {
    IWorkspaceDashboardsService,
    IGetDashboardOptions,
    IGetDashboardPluginOptions,
    IGetScheduledMailOptions,
    IWidgetAlertCount,
    SupportedDashboardReferenceTypes,
    IWidgetReferences,
    SupportedWidgetReferenceTypes,
    IDashboardReferences,
    IDashboardWithReferences,
    IDashboardsQuery,
    IDashboardsQueryResult,
    IRawExportCustomOverride,
    IRawExportCustomOverrides,
    IDashboardExportPdfOptions,
    IDashboardExportRawOptions,
    IDashboardExportTabularOptions,
    IDashboardExportImageOptions,
    IDashboardExportPresentationOptions,
    FiltersByTab,
} from "./workspace/dashboards/index.js";
export {
    type IWidgetWithLayoutPath,
    type LayoutPath,
    isDashboardLayoutEmpty,
    layoutWidgets,
    layoutWidgetsWithPaths,
    walkLayout,
} from "./workspace/dashboards/utils.js";
export type {
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "./workspace/users/index.js";
export type {
    IDateFilterConfigsQuery,
    IDateFilterConfigsQueryResult,
} from "./workspace/dateFilterConfigs/index.js";

export type {
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    IWorkspaceCatalogFactoryMethods,
    IWorkspaceCatalogMethods,
} from "./workspace/ldm/catalog.js";

export type {
    IDatasetsQueryFilterOptions,
    IDatasetsQuery,
    IDatasetsQueryResult,
    IWorkspaceDatasetsService,
} from "./workspace/ldm/datasets.js";

export type {
    IMeasureExpressionToken,
    IObjectExpressionToken,
    IAttributeElementExpressionToken,
    ITextExpressionToken,
    ICommentExpressionToken,
    IBracketExpressionToken,
} from "./workspace/measures/measure.js";

export type { IOrganization, IOrganizations } from "./organization/index.js";
export type { IEntitlements } from "./entitlements/index.js";
export type { IDataSourcesService } from "./dataSources/index.js";
export type { IGeoService, IGeoStyleSpecification } from "./geo/index.js";
export type { ISecuritySettingsService, ValidationContext } from "./organization/securitySettings/index.js";
export type { IOrganizationStylingService } from "./organization/styling/index.js";
export type { IOrganizationSettingsService } from "./organization/settings/index.js";

export type {
    IWorkspaceUserGroupsQuery,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUserGroupsQueryResult,
} from "./workspace/userGroups/index.js";

export type { IWorkspaceAccessControlService } from "./workspace/accessControl/index.js";

export type {
    IOrganizationUserService,
    IOrganizationUsersQuery,
    IOrganizationUsersQueryResult,
    IOrganizationUserGroupsQuery,
    IOrganizationUserGroupsQueryResult,
} from "./organization/users/index.js";
export type {
    IOrganizationPermissionService,
    IPermissionsAssignment,
} from "./organization/permissions/index.js";
export type { IOrganizationNotificationChannelService } from "./organization/notificationChannels/index.js";
export type {
    INotificationChannelsQuery,
    INotificationChannelsQueryResult,
    INotificationChannelIdentifiersQueryResult,
} from "./organization/notificationChannels/query.js";
export type { IDataFiltersService } from "./workspace/dataFilter/index.js";

export type { IWorkspaceLogicalModelService, IDateDataset } from "./workspace/ldm/model.js";

export type {
    IWorkspaceAutomationService,
    IGetAutomationOptions,
    IGetAutomationsOptions,
    IAutomationsQuery,
    IAutomationsQueryResult,
} from "./workspace/automations/index.js";

export type {
    IOrganizationAutomationService,
    IOrganizationAutomationsQuery,
    IOrganizationAutomationsQueryResult,
} from "./organization/automations/index.js";

export type {
    AutomationType,
    AutomationFilterType,
    IGetAutomationsQueryOptions,
} from "./common/automations.js";

export type {
    IWorkspaceKeyDriverAnalysisService,
    IChangeAnalysisResults,
    IKeyDriver,
    IChangeAnalysisPeriod,
    IChangeAnalysisOptions,
    IChangeAnalysisDefinition,
} from "./workspace/keyDriverAnalysis/index.js";

export type { IOrganizationLlmEndpointsService } from "./organization/llmEndpoints/index.js";

export type { IOrganizationNotificationService } from "./organization/notifications/index.js";
export type { INotificationsQuery, INotificationsQueryResult } from "./organization/notifications/query.js";
