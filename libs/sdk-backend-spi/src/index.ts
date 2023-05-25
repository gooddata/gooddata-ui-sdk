// (C) 2019-2023 GoodData Corporation
/**
 * This package provides definitions of the Service Provider Interface (SPI) for the Analytical Backend.
 *
 * @remarks
 * The interface defines functionality to be implemented for a particular backend to be used in GoodData.UI.
 * The Analytical Backend SPI for the GoodData platform (codename `bear` in `@gooddata/sdk-backend-bear`) is fully implemented.
 * The Analytical Backend SPI for GoodData Cloud and GoodData.CN (joint codename `tiger` in `@gooddata/sdk-backend-tiger`) is almost fully implemented.
 *
 * @packageDocumentation
 */
export {
    IAnalyticalBackend,
    IAnalyticalBackendConfig,
    AnalyticalBackendFactory,
    prepareExecution,
    IAuthenticationContext,
    IAuthenticatedPrincipal,
    IAuthenticationProvider,
    NotAuthenticatedHandler,
} from "./backend/index.js";

export { IBackendCapabilities } from "./backend/capabilities.js";

export { IUserSettings, IWorkspaceSettings, IUserWorkspaceSettings } from "./common/settings.js";

export { IUserService } from "./user/index.js";
export { IUserSettingsService } from "./user/settings/index.js";

export {
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    ExplainConfig,
    IExplainResult,
    IExplainProvider,
    ExplainType,
} from "./workspace/execution/index.js";

export { IWorkspaceSettingsService } from "./workspace/settings/index.js";

export { CancelableOptions, ICancelable } from "./cancelation/index.js";

export {
    IGetInsightOptions,
    IGetVisualizationClassesOptions,
    IWorkspaceInsightsService,
    InsightOrdering,
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    InsightReferenceTypes,
    SupportedInsightReferenceTypes,
} from "./workspace/insights/index.js";

export {
    IElementsQueryFactory,
    IElementsQueryResult,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryAttributeFilter,
    IElementsQueryOptionsElementsByUri,
    IElementsQueryOptionsElementsByValue,
    IElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    ElementsQueryOptionsElementsSpecification,
    isElementsQueryOptionsElementsByValue,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isValueBasedElementsQueryOptionsElements,
    IFilterElementsQuery,
    FilterWithResolvableElements,
} from "./workspace/attributes/elements/index.js";

export { IExportConfig, IExportResult, IExportBlobResult } from "./workspace/execution/export.js";

export { IWorkspaceStylingService } from "./workspace/styling/index.js";
export {
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
    NotAuthenticatedReason,
    LimitReached,
    ContractExpired,
    ErrorConverter,
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
    AuthenticationFlow,
    AnalyticalBackendErrorTypes,
} from "./errors/index.js";

export { IPagedResource } from "./common/paging.js";

export {
    IAnalyticalWorkspace,
    IWorkspacesQuery,
    IWorkspacesQueryFactory,
    IWorkspacesQueryResult,
    IWorkspaceDescriptor,
} from "./workspace/index.js";

export { IWorkspacePermissionsService } from "./workspace/permissions/index.js";

export { IWorkspaceAttributesService } from "./workspace/attributes/index.js";

export { IWorkspaceMeasuresService, IMeasureReferencing } from "./workspace/measures/index.js";

export { IWorkspaceFactsService } from "./workspace/facts/index.js";

export {
    IWorkspaceDashboardsService,
    IGetDashboardOptions,
    IGetScheduledMailOptions,
    IWidgetAlertCount,
    SupportedDashboardReferenceTypes,
    IWidgetReferences,
    SupportedWidgetReferenceTypes,
    IDashboardReferences,
    IDashboardWithReferences,
} from "./workspace/dashboards/index.js";
export {
    isDashboardLayoutEmpty,
    IWidgetWithLayoutPath,
    LayoutPath,
    layoutWidgets,
    layoutWidgetsWithPaths,
    walkLayout,
} from "./workspace/dashboards/utils.js";
export {
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "./workspace/users/index.js";
export {
    IDateFilterConfigsQuery,
    IDateFilterConfigsQueryResult,
} from "./workspace/dateFilterConfigs/index.js";

export {
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    IWorkspaceCatalogFactoryMethods,
    IWorkspaceCatalogMethods,
} from "./workspace/ldm/catalog.js";

export { IWorkspaceDatasetsService } from "./workspace/ldm/datasets.js";

export {
    IMeasureExpressionToken,
    IObjectExpressionToken,
    IAttributeElementExpressionToken,
    ITextExpressionToken,
    ICommentExpressionToken,
    IBracketExpressionToken,
} from "./workspace/measures/measure.js";

export { IOrganization, IOrganizations } from "./organization/index.js";
export { IEntitlements } from "./entitlements/index.js";
export { ISecuritySettingsService, ValidationContext } from "./organization/securitySettings/index.js";
export { IOrganizationStylingService } from "./organization/styling/index.js";
export { IOrganizationSettingsService } from "./organization/settings/index.js";

export {
    IWorkspaceUserGroupsQuery,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUserGroupsQueryResult,
} from "./workspace/userGroups/index.js";

export { IWorkspaceAccessControlService } from "./workspace/accessControl/index.js";
