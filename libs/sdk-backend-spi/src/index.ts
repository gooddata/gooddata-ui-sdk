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

export { IUserSettings, IWorkspaceSettings, IUserWorkspaceSettings } from "./common/settings";

export { IUserService, IUser, userFullName } from "./user";
export { IUserSettingsService } from "./user/settings";

export {
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    ExplainConfig,
} from "./workspace/execution";

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

export { IWorkspaceStylingService } from "./workspace/styling";
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

export { IWorkspacePermissionsService } from "./workspace/permissions";

export { IWorkspaceAttributesService } from "./workspace/attributes";

export { IWorkspaceMeasuresService, IMeasureReferencing } from "./workspace/measures";

export { IWorkspaceFactsService } from "./workspace/facts";

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
} from "./workspace/dashboards";
export {
    isDashboardLayoutEmpty,
    IWidgetWithLayoutPath,
    LayoutPath,
    layoutWidgets,
    layoutWidgetsWithPaths,
    walkLayout,
} from "./workspace/dashboards/utils";
export {
    IWorkspaceUser,
    IWorkspaceUsersQuery,
    IWorkspaceUsersQueryOptions,
    IWorkspaceUsersQueryResult,
} from "./workspace/users";
export { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "./workspace/dateFilterConfigs";

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
    IMeasureExpressionToken,
    IObjectExpressionToken,
    IAttributeElementExpressionToken,
    ITextExpressionToken,
    ICommentExpressionToken,
    IBracketExpressionToken,
} from "./workspace/measures/measure";

export { IOrganization, IOrganizations, IOrganizationDescriptor } from "./organization";
export { ISecuritySettingsService, ValidationContext } from "./organization/securitySettings";

export {
    IWorkspaceUserGroupsQuery,
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
export { IDashboardObjectIdentity } from "./deprecated/dashboard/common";
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
} from "./deprecated/dashboard/filterContext";
export {
    IWidgetAlertBase,
    IWidgetAlert,
    IWidgetAlertDefinition,
    isWidgetAlert,
    isWidgetAlertDefinition,
} from "./deprecated/dashboard/alert";
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
} from "./deprecated/dashboard/drills";
export {
    IWidgetDescription,
    IDrillableWidget,
    BuiltInWidgetTypes,
    IFilterableWidget,
    IBaseWidget,
} from "./deprecated/dashboard/baseWidget";

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
} from "./deprecated/dashboard/kpi";

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
} from "./deprecated/dashboard/analyticalWidgets";

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
} from "./deprecated/ldm/catalog";

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
} from "./deprecated/ldm/metadata";

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
} from "./deprecated/ldm/datasets";

export { IAttributeElement } from "./deprecated/ldm/attributeElement";

export {
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    widgetUri,
    widgetId,
    widgetRef,
    widgetTitle,
    widgetType,
    isKpiWidgetDefinition,
    isKpiWidget,
    isInsightWidgetDefinition,
    isInsightWidget,
} from "./deprecated/dashboard/widget";

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
} from "./deprecated/dashboard/scheduledMail";

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
} from "./deprecated/dashboard/layout";

export {
    IDashboard,
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
} from "./deprecated/dashboard/dashboard";

export { ISettings, ISeparators, PlatformEdition } from "./deprecated/settings";

export { IWorkspaceUserGroup } from "./deprecated/userGroups";

export {
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
} from "./deprecated/theme";

export { IWorkspacePermissions, WorkspacePermission } from "./deprecated/permissions";

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
} from "./deprecated/execution/results";
