// (C) 2019-2021 GoodData Corporation

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
} from "./common/settings";

export { IUserService, IUser } from "./user";
export { IUserSettingsService } from "./user/settings";

export { IExecutionFactory, IPreparedExecution, IExecutionResult, IDataView } from "./workspace/execution";

export {
    DataValue,
    IMeasureDescriptor,
    IDimensionItemDescriptor,
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    ITotalDescriptor,
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
} from "./workspace/attributes/elements";

export { IExportConfig, IExportResult } from "./workspace/execution/export";

export {
    IWorkspaceStylingService,
    ThemeFontUri,
    ThemeColor,
    IThemeColorFamily,
    IThemeWidgetTitle,
    IThemeTypography,
    IThemePalette,
    IThemeKpi,
    IThemeChart,
    ITheme,
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

export { IWorkspaceDashboardsService } from "./workspace/dashboards";
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
} from "./workspace/dashboards/drills";
export {
    IDashboard,
    IDashboardReferences,
    IDashboardWithReferences,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardBase,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
    IDashboardDateFilterAddedPresets,
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
} from "./workspace/dashboards/filterContext";
export {
    IDashboardLayout,
    IDashboardLayoutColumn,
    IDashboardLayoutContent,
    IDashboardLayoutRow,
    isDashboardLayoutContent,
} from "./workspace/dashboards/layout/dashboardLayout";
export {
    ResponsiveScreenType,
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    isFluidLayout,
    isFluidLayoutColumn,
    isFluidLayoutRow,
} from "./workspace/dashboards/layout/fluidLayout";
export { FluidLayoutFacade } from "./workspace/dashboards/layout/facade/layout";
export { FluidLayoutColumnFacade } from "./workspace/dashboards/layout/facade/column";
export { FluidLayoutColumnsFacade } from "./workspace/dashboards/layout/facade/columns";
export { FluidLayoutRowFacade } from "./workspace/dashboards/layout/facade/row";
export { FluidLayoutRowsFacade } from "./workspace/dashboards/layout/facade/rows";
export { FluidLayoutBuilder } from "./workspace/dashboards/layout/builder/layout";
export { FluidLayoutRowBuilder } from "./workspace/dashboards/layout/builder/row";
export { FluidLayoutColumnBuilder } from "./workspace/dashboards/layout/builder/column";
export {
    FluidLayoutColumnModifications,
    FluidLayoutColumnsSelector,
    FluidLayoutModifications,
    FluidLayoutRowModifications,
    FluidLayoutRowsSelector,
    IFluidLayoutBuilder,
    IFluidLayoutColumnBuilder,
    IFluidLayoutRowBuilder,
    ValueOrUpdateCallback,
    IFluidLayoutBuilderImpl,
    IFluidLayoutColumnBuilderImpl,
    IFluidLayoutRowBuilderImpl,
} from "./workspace/dashboards/layout/builder/interfaces";
export { resolveValueOrUpdateCallback } from "./workspace/dashboards/layout/builder/utils";
export {
    isFluidLayoutEmpty,
    IWidgetWithLayoutPath,
    LayoutPath,
    layoutWidgets,
    layoutWidgetsWithPaths,
    walkLayout,
} from "./workspace/dashboards/layout/utils";
export {
    IFluidLayoutFacade,
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnsFacade,
    IFluidLayoutRowFacade,
    IFluidLayoutRowsFacade,
    IFluidLayoutColumnFacadeImpl,
    IFluidLayoutColumnsFacadeImpl,
    IFluidLayoutFacadeImpl,
    IFluidLayoutRowFacadeImpl,
    IFluidLayoutRowsFacadeImpl,
} from "./workspace/dashboards/layout/facade/interfaces";
export {
    IWidget,
    IWidgetDefinition,
    IInsightWidget,
    IInsightWidgetBase,
    IInsightWidgetDefinition,
    IKpiWidget,
    IKpiWidgetBase,
    IKpiWidgetDefinition,
    WidgetType,
    isWidget,
    isWidgetDefinition,
    isInsightWidget,
    isInsightWidgetDefinition,
    isKpiWidget,
    isKpiWidgetDefinition,
    IWidgetReferences,
    SupportedWidgetReferenceTypes,
    widgetUri,
    widgetId,
    widgetType,
    IWidgetBase,
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
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
    IScheduledMailBase,
} from "./workspace/dashboards/scheduledMail";
export { IWorkspaceUser, IWorkspaceUsersQuery, IWorkspaceUsersQueryOptions } from "./workspace/users";
export { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "./workspace/dateFilterConfigs";
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
} from "./workspace/dateFilterConfigs/types";

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
    IMeasureMetadataObject,
    isMeasureMetadataObject,
    IMetadataObject,
    isMetadataObject,
    MetadataObject,
    metadataObjectId,
} from "./workspace/fromModel/ldm/metadata";

export {
    DataColumnType,
    DatasetLoadStatus,
    IDataColumn,
    IDataHeader,
    IDatasetLoadInfo,
    IDatasetUser,
    IDataset,
} from "./workspace/fromModel/ldm/datasets";

export { IAttributeElement } from "./workspace/fromModel/ldm/attributeElement";

export {
    IMeasureExpressionToken,
    IObjectExpressionToken,
    IAttributeElementExpressionToken,
    ITextExpressionToken,
} from "./workspace/fromModel/ldm/measure";
