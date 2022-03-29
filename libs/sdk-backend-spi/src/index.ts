// (C) 2019-2022 GoodData Corporation
/**
 * This package provides definitions of the Service Provider Interface (SPI) for the Analytical Backend.
 *
 * @remarks
 * The interface defines functionality to be implemented for a particular backend to be used in GoodData.UI.
 * The Analytical Backend SPI for the GoodData platform (codename `bear` in `@gooddata/sdk-backend-bear`) is fully implemented.
 * The Analytical Backend SPI for GoodData.CN (codename `tiger` in `@gooddata/sdk-backend-tiger`) is almost fully implemented.
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
} from "./backend";

export { IBackendCapabilities } from "./backend/capabilities";

export {
    ISettings,
    IUserSettings,
    IWorkspaceSettings,
    IUserWorkspaceSettings,
    ISeparators,
    PlatformEdition,
} from "./common/settings";

export { IUserService, IUser, userFullName } from "./user";
export { IUserSettingsService } from "./user/settings";

export {
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    ExplainConfig,
} from "./workspace/execution";

export {
    DataValue,
    IMeasureDescriptor,
    IMeasureDescriptorObject,
    IMeasureDescriptorItem,
    IDimensionItemDescriptor,
    IDimensionDescriptor,
    IAttributeHeaderFormOf,
    IAttributeDescriptorBody,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    IResultAttributeHeaderItem,
    IResultMeasureHeaderItem,
    IResultTotalHeader,
    IResultTotalHeaderItem,
    ITotalDescriptor,
    ITotalDescriptorItem,
    IResultWarning,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isTotalDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    resultHeaderName,
    attributeDescriptorLocalId,
    attributeDescriptorName,
} from "./workspace/execution/results";

export { IWorkspaceSettingsService } from "./workspace/settings";

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
} from "./workspace/insights";

export {
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    IWorkspaceCatalogFactoryMethods,
    IWorkspaceCatalogMethods,
} from "./workspace/ldm/catalog";

export { IWorkspaceDatasetsService } from "./workspace/ldm/datasets";

export {
    IElementsQueryFactory,
    IElementsQueryResult,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryAttributeFilter,
    IElementsQueryOptionsElementsByUri,
    IElementsQueryOptionsElementsByValue,
    IElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isElementsQueryOptionsElementsByValue,
    isElementsQueryOptionsElementsByPrimaryDisplayFormValue,
    isValueBasedElementsQueryOptionsElements,
    IFilterElementsQuery,
    FilterWithResolvableElements,
} from "./workspace/attributes/elements";

export { IExportConfig, IExportResult } from "./workspace/execution/export";

export {
    IWorkspaceStylingService,
    ThemeFontUri,
    ThemeColor,
    IThemeColorFamily,
    IThemeComplementaryPalette,
    IThemeWidgetTitle,
    IThemeTypography,
    IThemePalette,
    IThemeKpi,
    IThemeKpiValue,
    IThemeChart,
    IThemeTable,
    ITheme,
    IThemeAnalyticalDesigner,
    IThemeAnalyticalDesignerTitle,
    IThemeButton,
    IThemeDashboard,
    IThemeDashboardContent,
    IThemeDashboardContentKpi,
    IThemeDashboardContentWidget,
    IThemeDashboardEditPanel,
    IThemeDashboardFilterBar,
    IThemeDashboardFilterBarButton,
    IThemeDashboardNavigation,
    IThemeDashboardNavigationItem,
    IThemeDashboardNavigationTitle,
    IThemeDashboardSection,
    IThemeDashboardSectionDescription,
    IThemeDashboardSectionTitle,
    IThemeDashboardTitle,
    IThemeModal,
    IThemeModalTitle,
    IThemeTooltip,
} from "./workspace/styling";

export {
    AnalyticalBackendError,
    NoDataError,
    DataTooLargeError,
    ProtectedDataError,
    UnexpectedResponseError,
    UnexpectedError,
    NotSupported,
    NotImplemented,
    NotAuthenticated,
    NotAuthenticatedReason,
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
    AuthenticationFlow,
    AnalyticalBackendErrorTypes,
} from "./errors";

export { IPagedResource } from "./common/paging";

export {
    IAnalyticalWorkspace,
    IWorkspacesQuery,
    IWorkspacesQueryFactory,
    IWorkspacesQueryResult,
    IWorkspaceDescriptor,
} from "./workspace";

export {
    IWorkspacePermissionsService,
    IWorkspacePermissions,
    WorkspacePermission,
} from "./workspace/permissions";

export { IWorkspaceAttributesService } from "./workspace/attributes";

export { IWorkspaceMeasuresService } from "./workspace/measures";

export { IWorkspaceFactsService } from "./workspace/facts";

export {
    IWorkspaceDashboardsService,
    IGetDashboardOptions,
    IGetScheduledMailOptions,
    SupportedDashboardReferenceTypes,
} from "./workspace/dashboards";
export { IDashboardObjectIdentity } from "./workspace/dashboards/common";
export {
    DrillDefinition,
    InsightDrillDefinition,
    KpiDrillDefinition,
    DrillOrigin,
    DrillOriginType,
    DrillTransition,
    DrillType,
    IDrill,
    IDrillFromMeasure,
    IDrillFromAttribute,
    IDrillOrigin,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    IDrillToAttributeUrl,
    isDrillToAttributeUrl,
    IDrillToCustomUrl,
    isDrillToCustomUrl,
    IDrillTarget,
    IDrillToAttributeUrlTarget,
    IDrillToCustomUrlTarget,
    isDrillFromAttribute,
    isDrillFromMeasure,
} from "./workspace/dashboards/drills";
export {
    IDashboard,
    IDashboardReferences,
    IDashboardWithReferences,
    IDashboardDefinition,
    IListedDashboard,
    ListedDashboardAvailability,
    IDashboardBase,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
    IDashboardDateFilterAddedPresets,
    IDashboardPluginBase,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    isDashboard,
    isDashboardDefinition,
    IAccessControlAware,
    ShareStatus,
} from "./workspace/dashboards/dashboard";
export {
    IFilterContext,
    AbsoluteType,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilterParent,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterContextDefinition,
    RelativeType,
    ITempFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IDashboardFilterReference,
    IDashboardAttributeFilterReference,
    IDashboardDateFilterReference,
    isDashboardAttributeFilterReference,
    isDashboardDateFilterReference,
    IFilterContextBase,
    dashboardFilterReferenceObjRef,
    isAllTimeDashboardDateFilter,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "./workspace/dashboards/filterContext";
export {
    IDashboardLayout,
    IDashboardWidget,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    ScreenSize,
    isDashboardLayout,
    isDashboardLayoutSection,
    isDashboardLayoutItem,
    isDashboardWidget,
} from "./workspace/dashboards/layout";
export {
    isDashboardLayoutEmpty,
    IWidgetWithLayoutPath,
    LayoutPath,
    layoutWidgets,
    layoutWidgetsWithPaths,
    walkLayout,
} from "./workspace/dashboards/utils";
export {
    IWidgetDescription,
    IDrillableWidget,
    BuiltInWidgetTypes,
    IFilterableWidget,
    IBaseWidget,
} from "./workspace/dashboards/baseWidget";
export {
    AnalyticalWidgetType,
    WidgetType,
    IAnalyticalWidget,
    IKpiWidget,
    IKpiWidgetBase,
    IKpiWidgetDefinition,
    IInsightWidget,
    IInsightWidgetBase,
    IInsightWidgetDefinition,
    IInsightWidgetConfiguration,
} from "./workspace/dashboards/analyticalWidgets";
export {
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    IWidgetReferences,
    SupportedWidgetReferenceTypes,
    widgetUri,
    widgetId,
    widgetRef,
    widgetTitle,
    widgetType,
    isKpiWidgetDefinition,
    isKpiWidget,
    isInsightWidgetDefinition,
    isInsightWidget,
} from "./workspace/dashboards/widget";
export {
    ILegacyKpi,
    ILegacyKpiBase,
    ILegacyKpiComparisonDirection,
    ILegacyKpiComparisonTypeComparison,
    ILegacyKpiWithPopComparison,
    ILegacyKpiWithPreviousPeriodComparison,
    ILegacyKpiWithComparison,
    ILegacyKpiWithoutComparison,
    isLegacyKpiWithComparison,
    isLegacyKpiWithoutComparison,
    isLegacyKpi,
} from "./workspace/dashboards/kpi";
export {
    IWidgetAlertBase,
    IWidgetAlert,
    IWidgetAlertDefinition,
    IWidgetAlertCount,
    isWidgetAlert,
    isWidgetAlertDefinition,
} from "./workspace/dashboards/alert";
export {
    IDashboardAttachment,
    isDashboardAttachment,
    IWidgetAttachment,
    isWidgetAttachment,
    IExportOptions,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
    IScheduledMailBase,
} from "./workspace/dashboards/scheduledMail";
export {
    IWorkspaceUser,
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "./workspace/users";
export { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "./workspace/dateFilterConfigs";

export {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogDateAttribute,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogDateDataset,
    ICatalogItemBase,
    IGroupableCatalogItemBase,
    GroupableCatalogItem,
    catalogItemMetadataObject,
} from "./workspace/fromModel/ldm/catalog";

export {
    IAttributeDisplayFormMetadataObject,
    isAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    isAttributeMetadataObject,
    IDataSetMetadataObject,
    isDataSetMetadataObject,
    IVariableMetadataObject,
    isVariableMetadataObject,
    IFactMetadataObject,
    isFactMetadataObject,
    IMetadataObjectDefinition,
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    isMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    isMeasureMetadataObjectDefinition,
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    isMetadataObject,
    MetadataObject,
    metadataObjectId,
    IDashboardMetadataObject,
    isDashboardMetadataObject,
    IMeasureReferencing,
} from "./workspace/fromModel/ldm/metadata";

export {
    DataColumnType,
    DatasetLoadStatus,
    IDataColumnBody,
    IDataColumn,
    IDataHeader,
    IDatasetLoadInfo,
    IDatasetUser,
    IDataset,
    IDatasetBody,
} from "./workspace/fromModel/ldm/datasets";

export { IAttributeElement } from "./workspace/fromModel/ldm/attributeElement";

export {
    IMeasureExpressionToken,
    IObjectExpressionToken,
    IAttributeElementExpressionToken,
    ITextExpressionToken,
    ICommentExpressionToken,
    IBracketExpressionToken,
} from "./workspace/fromModel/ldm/measure";

export { IOrganization, IOrganizations, IOrganizationDescriptor } from "./organization";
export { ISecuritySettingsService, ValidationContext } from "./organization/securitySettings";

export {
    IWorkspaceUserGroupsQuery,
    IWorkspaceUserGroup,
    IWorkspaceUserGroupsQueryOptions,
    IWorkspaceUserGroupsQueryResult,
} from "./workspace/userGroups";

export {
    IWorkspaceAccessControlService,
    AccessGranteeDetail,
    IAccessGrantee,
    IUserAccessGrantee,
    IUserGroupAccessGrantee,
    IUserAccess,
    IUserGroupAccess,
    isUserAccess,
    isUserGroupAccess,
    isUserGroupAccessGrantee,
    isUserAccessGrantee,
} from "./workspace/accessControl";

// Moved to @gooddata/sdk-model
export {
    IDateFilterConfig,
    AbsoluteFormType,
    AbsolutePresetType,
    AllTimeType,
    DateFilterGranularity,
    DateString,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilterOption,
    IDateFilterOption,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    OptionType,
    RelativeFormType,
    RelativeGranularityOffset,
    RelativePresetType,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
    isDateFilterGranularity,
} from "./deprecated/dateFilterConfigs";
