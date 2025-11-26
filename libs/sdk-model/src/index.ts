// (C) 2019-2025 GoodData Corporation

/**
 * This package provides domain models for GoodData.UI.
 *
 * @remarks
 * These domain models are backend-agnostic. This makes them reusable across different Analytical Backend implementations.
 * The package includes TypeScript type definitions, factory functions, functions to get or set certain
 * properties of the objects in an immutable way, and more.
 * These are used in both the `@gooddata/sdk-backend-*` and `@gooddata/sdk-ui*` packages.
 *
 * @packageDocumentation
 */
export type { DateAttributeGranularity, AllTimeGranularity } from "./base/dateGranularities.js";
export { DateGranularity } from "./base/dateGranularities.js";
export type { IAuditable, IAuditableDates, IAuditableUsers } from "./base/metadata.js";
export type { ComparatorDirection, IComparator } from "./base/comparators.js";
export { assertNever } from "./base/typeUtils.js";

export type { IAttribute, IAttributeBody, AttributePredicate } from "./execution/attribute/index.js";
export {
    isAttribute,
    attributeLocalId,
    anyAttribute,
    idMatchAttribute,
    attributesFind,
    attributeUri,
    attributeIdentifier,
    attributeAlias,
    attributeShowAllValues,
    attributeDisplayFormRef,
} from "./execution/attribute/index.js";

export type { AttributeModifications, AttributeBuilderInput } from "./execution/attribute/factory.js";
export { newAttribute, modifyAttribute, AttributeBuilder } from "./execution/attribute/factory.js";

export type {
    INotificationChannelMetadataObjectBase,
    ICustomSmtpDestinationConfiguration,
    IDefaultSmtpDestinationConfiguration,
    IInPlatformNotificationChannelMetadataObject,
    IInPlatformNotificationChannelMetadataObjectDefinition,
    ISmtpDestinationConfiguration,
    ISmtpNotificationChannelMetadataObject,
    ISmtpNotificationChannelMetadataObjectDefinition,
    IWebhookDestinationConfiguration,
    IWebhookNotificationChannelMetadataObject,
    IWebhookNotificationChannelMetadataObjectDefinition,
    NotificationChannelAllowedRecipients,
    NotificationChannelDestinationType,
    INotificationChannelMetadataObject,
    INotificationChannelMetadataObjectDefinition,
    NotificationChannelDashboardLinkVisibility,
    INotificationChannelTestResponse,
    ToNotificationChannelMetadataObject,
    INotificationChannelIdentifier,
    INotificationChannelExternalRecipient,
} from "./notificationChannels/index.js";
export {
    isNotificationChannelMetadataObject,
    isNotificationChannelMetadataObjectDefinition,
} from "./notificationChannels/index.js";
export type {
    AlertDescriptionStatus,
    AutomationNotificationType,
    IAlertDescription,
    IAlertEvaluationRow,
    IAlertEvaluationRowMetric,
    IAlertNotification,
    IAlertNotificationDetails,
    IAutomationNotificationDetailsBase,
    INotification,
    INotificationBase,
    IScheduleNotification,
    IScheduleNotificationDetails,
    ITestNotification,
    ITestNotificationDetails,
    IWebhookAutomationInfo,
    IWebhookMessageDataAlert,
    IWebhookMessageDataBase,
    IWebhookMessageDataSchedule,
    NotificationType,
    WebhookRecipient,
    AlertFilters,
} from "./notifications/index.js";
export {
    isAlertNotification,
    isScheduleNotification,
    isTestNotification,
    isNotification,
} from "./notifications/index.js";

export type {
    ObjectType,
    ObjectOrigin,
    Identifier,
    Uri,
    UriRef,
    IdentifierRef,
    LocalIdRef,
    ObjRef,
    ObjRefInScope,
} from "./objRef/index.js";
export {
    isUriRef,
    isIdentifierRef,
    objRefToString,
    isLocalIdRef,
    areObjRefsEqual,
    isObjRef,
    serializeObjRef,
    deserializeObjRef,
} from "./objRef/index.js";

export type { IDimension, DimensionItem, ItemInDimension } from "./execution/base/dimension.js";
export {
    isDimension,
    dimensionTotals,
    newTwoDimensional,
    newDimension,
    MeasureGroupIdentifier,
    dimensionSetTotals,
    dimensionsFindItem,
    isMeasureGroupIdentifier,
} from "./execution/base/dimension.js";

export { idRef, uriRef, localIdRef } from "./objRef/factory.js";

export type { TotalType, ITotal } from "./execution/base/totals.js";
export { isTotal, newTotal, totalIsNative } from "./execution/base/totals.js";

export type {
    SortDirection,
    ISortDirection,
    IAttributeSortItem,
    IAttributeSortTarget,
    IAttributeSortType,
    ISortItem,
    IMeasureSortItem,
    IMeasureSortTarget,
    ILocatorItem,
    IAttributeLocatorItem,
    IAttributeLocatorItemBody,
    IMeasureLocatorItem,
    IMeasureLocatorItemBody,
    ITotalLocatorItem,
    ITotalLocatorItemBody,
    SortEntityIds,
} from "./execution/base/sort.js";
export {
    isMeasureLocator,
    isAttributeLocator,
    isTotalLocator,
    isMeasureSort,
    isAttributeSort,
    isAttributeAreaSort,
    isAttributeValueSort,
    newMeasureSort,
    newMeasureSortFromLocators,
    newAttributeSort,
    newAttributeAreaSort,
    newAttributeLocator,
    newAttributeLocatorWithNullElement,
    sortEntityIds,
    sortDirection,
    sortMeasureLocators,
    attributeLocatorElement,
    attributeLocatorIdentifier,
    measureLocatorIdentifier,
} from "./execution/base/sort.js";

export type {
    IAttributeElementsByRef,
    IAttributeElementsByValue,
    IAttributeElements,
    IPositiveAttributeFilter,
    IPositiveAttributeFilterBody,
    INegativeAttributeFilter,
    INegativeAttributeFilterBody,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IMeasureValueFilter,
    IMeasureValueFilterBody,
    IRankingFilter,
    IRankingFilterBody,
    RankingFilterOperator,
    IFilter,
    IIdentifiableFilter,
    INullableFilter,
    IMeasureFilter,
    IDateFilter,
    IAttributeFilter,
    ComparisonConditionOperator,
    IComparisonCondition,
    IComparisonConditionBody,
    IRangeCondition,
    IRangeConditionBody,
    MeasureValueFilterCondition,
    RangeConditionOperator,
    IAbsoluteDateFilterValues,
    IRelativeDateFilterValues,
    IAbsoluteDateFilterBody,
    IRelativeDateFilterBody,
    IRelativeDateFilterAllTimeBody,
    IRelativeBoundedDateFilterBody,
    IUpperBoundedFilter,
    ILowerBoundedFilter,
} from "./execution/filter/index.js";
export {
    isRankingFilter,
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isAllTimeDateFilter,
    attributeElementsIsEmpty,
    attributeElementsCount,
    updateAttributeElementsItems,
    getAttributeElementsItems,
    isSimpleMeasureFilter,
    isPositiveAttributeFilter,
    isNegativeAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isComparisonCondition,
    isComparisonConditionOperator,
    isFilter,
    isRangeCondition,
    isRangeConditionOperator,
    filterIsEmpty,
    filterAttributeElements,
    filterMeasureRef,
    filterObjRef,
    filterLocalIdentifier,
    absoluteDateFilterValues,
    relativeDateFilterValues,
    measureValueFilterCondition,
    measureValueFilterMeasure,
    measureValueFilterOperator,
    isRelativeBoundedDateFilterBody,
    isRelativeUpperBoundedDateFilterBody,
    isRelativeLowerBoundedDateFilterBody,
    isRelativeBoundedDateFilter,
    isRelativeUpperBoundedDateFilter,
    isRelativeLowerBoundedDateFilter,
    isLowerBound,
    isUpperBound,
} from "./execution/filter/index.js";

export {
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newAllTimeFilter,
    newMeasureValueFilter,
    newRankingFilter,
} from "./execution/filter/factory.js";

export { mergeFilters } from "./execution/filter/filterMerge.js";

export type {
    IMeasureTitle,
    IMeasureTitleBody,
    IMeasureDefinitionType,
    IMeasureDefinition,
    IMeasureDefinitionBody,
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IVirtualArithmeticMeasureDefinition,
    IPoPMeasureDefinition,
    IPoPMeasureDefinitionBody,
    IMeasure,
    IMeasureBody,
    MeasureAggregation,
    IInlineMeasureDefinition,
    IPreviousPeriodMeasureDefinition,
    IPreviousPeriodMeasureDefinitionBody,
    IPreviousPeriodDateDataSet,
    MeasurePredicate,
    MeasureOrLocalId,
} from "./execution/measure/index.js";
export {
    isMeasure,
    isSimpleMeasure,
    isInlineMeasure,
    isAdhocMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isArithmeticMeasure,
    isVirtualArithmeticMeasure,
    isMeasureDefinition,
    isPoPMeasureDefinition,
    isPreviousPeriodMeasureDefinition,
    isArithmeticMeasureDefinition,
    isVirtualArithmeticMeasureDefinition,
    isInlineMeasureDefinition,
    measureLocalId,
    anyMeasure,
    idMatchMeasure,
    measureDoesComputeRatio,
    measureItem,
    measureUri,
    measureIdentifier,
    measureMasterIdentifier,
    measureArithmeticOperands,
    measureAlias,
    measureTitle,
    measureArithmeticOperator,
    measureFormat,
    isMeasureFormatInPercent,
    measureAggregation,
    measureFilters,
    measurePopAttribute,
    measurePreviousPeriodDateDataSets,
} from "./execution/measure/index.js";

export type {
    IPreviousPeriodDateDataSetSimple,
    MeasureModifications,
    MeasureEnvelope,
    InlineMeasureBuilderInput,
    ArithmeticMeasureBuilderInput,
    PoPMeasureBuilderInput,
    PreviousPeriodMeasureBuilderInput,
} from "./execution/measure/factory.js";
export {
    ArithmeticMeasureBuilder,
    VirtualArithmeticMeasureBuilder,
    MeasureBuilder,
    PoPMeasureBuilder,
    PreviousPeriodMeasureBuilder,
    InlineMeasureBuilder,
    MeasureBuilderBase,
    newMeasure,
    modifyMeasure,
    modifySimpleMeasure,
    modifyPopMeasure,
    modifyPreviousPeriodMeasure,
    modifyInlineMeasure,
    newArithmeticMeasure,
    newVirtualArithmeticMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    newInlineMeasure,
} from "./execution/measure/factory.js";

export type {
    IAttributeOrMeasure,
    IBucket,
    MeasureInBucket,
    AttributeInBucket,
    BucketPredicate,
    BucketItemModifications,
    BucketItemReducer,
} from "./execution/buckets/index.js";
export {
    isBucket,
    idMatchBucket,
    anyBucket,
    newBucket,
    bucketIsEmpty,
    bucketAttributes,
    bucketAttribute,
    bucketAttributeIndex,
    bucketMeasure,
    bucketMeasureIndex,
    bucketMeasures,
    bucketTotals,
    bucketSetTotals,
    bucketItems,
    applyRatioRule,
    ComputeRatioRule,
    disableComputeRatio,
    bucketModifyItems,
    bucketItemReduce,
} from "./execution/buckets/index.js";

export {
    bucketsFind,
    bucketsMeasures,
    bucketsIsEmpty,
    bucketsAttributes,
    bucketsFindMeasure,
    bucketsById,
    bucketsFindAttribute,
    bucketsItems,
    bucketsTotals,
    bucketsModifyItem,
    bucketsReduceItem,
} from "./execution/buckets/bucketArray.js";

export { bucketItemLocalId } from "./execution/buckets/bucketItem.js";

export type {
    IExecutionDefinition,
    IExecutionConfig,
    DimensionGenerator,
    IPostProcessing,
} from "./execution/executionDefinition/index.js";
export {
    defWithFilters,
    defFingerprint,
    defSetDimensions,
    defSetSorts,
    defSetBuckets,
    defTotals,
    defSetExecConfig,
    defSetPostProcessing,
} from "./execution/executionDefinition/index.js";

export {
    newDefForItems,
    newDefForBuckets,
    newDefForInsight,
    defWithDimensions,
    defWithSorting,
    defWithPostProcessing,
    defWithBuckets,
    defWithDateFormat,
    defWithExecConfig,
    defaultDimensionsGenerator,
    emptyDef,
} from "./execution/executionDefinition/factory.js";

export type {
    GuidType,
    RgbType,
    IRgbColorValue,
    IColor,
    IColorPalette,
    IColorPaletteItem,
    IColorFromPalette,
    IRgbColor,
    IColorPaletteMetadataObject,
    IColorPaletteDefinition,
} from "./colors/index.js";
export {
    isColorFromPalette,
    isRgbColor,
    isColorPaletteItem,
    colorPaletteItemToRgb,
    colorPaletteToColors,
} from "./colors/index.js";

export type {
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    IVisualizationClassBody,
    VisualizationProperties,
    IAttributeFilterConfigs,
    IAttributeFilterConfig,
    IColorMappingItem,
    InsightDisplayFormUsage,
} from "./insight/index.js";
export {
    isInsight,
    isColorMappingItem,
    insightRef,
    insightId,
    insightItems,
    insightMeasures,
    insightHasMeasures,
    insightAttributes,
    insightHasAttributes,
    insightHasDataDefined,
    insightProperties,
    insightBuckets,
    insightSorts,
    insightBucket,
    insightTags,
    insightSummary,
    insightTitle,
    insightUri,
    insightIsLocked,
    insightCreated,
    insightCreatedBy,
    insightUpdated,
    insightUpdatedBy,
    insightTotals,
    insightFilters,
    insightAttributeFilterConfigs,
    insightVisualizationUrl,
    insightVisualizationType,
    insightSetFilters,
    insightSetBuckets,
    insightSetProperties,
    insightSetSorts,
    insightModifyItems,
    insightReduceItems,
    insightDisplayFormUsage,
    visClassUrl,
    visClassId,
    visClassUri,
} from "./insight/index.js";

export {
    insightCreatedComparator,
    insightCreatedByComparator,
    insightTitleComparator,
    insightUpdatedComparator,
    insightUpdatedByComparator,
} from "./insight/comparators.js";

export type { InsightModifications } from "./insight/factory.js";
export { newInsightDefinition, InsightDefinitionBuilder } from "./insight/factory.js";

export { insightSanitize, sanitizeBucketTotals } from "./insight/sanitization.js";

export { factoryNotationFor } from "./execution/objectFactoryNotation/index.js";

export type {
    DateFilterOptionAbsoluteFormType,
    DateFilterOptionAbsolutePresetType,
    DateFilterOptionAllTimeType,
    DateFilterOptionType,
    DateFilterOptionRelativeFormType,
    DateFilterOptionRelativePresetType,
    RelativeDateFilterGranularityOffset,
    DateFilterGranularity,
    DateString,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilterOption,
    IDateFilterConfig,
    IDateFilterOption,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
} from "./dateFilterConfig/index.js";
export {
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isDateFilterGranularity,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "./dateFilterConfig/index.js";

export type { IDashboardObjectIdentity } from "./dashboard/common.js";

export type {
    DateFilterAbsoluteType,
    DateFilterRelativeType,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilter,
    DashboardAttributeFilterSelectionMode,
    IDashboardAttributeFilterParent,
    IDashboardAttributeFilterReference,
    IDashboardAttributeFilterByDate,
    IDashboardDateFilter,
    IDashboardDateFilterReference,
    IDashboardFilterReference,
    IFilterContext,
    IFilterContextBase,
    IFilterContextDefinition,
    ITempFilterContext,
    IDashboardFilterView,
    IDashboardFilterViewSaveRequest,
} from "./dashboard/filterContext.js";
export {
    dashboardFilterReferenceObjRef,
    isAllTimeDashboardDateFilter,
    isAllValuesDashboardAttributeFilter,
    isDashboardAttributeFilter,
    isSingleSelectionFilter,
    isNegativeAttributeFilter as isNegativeDashboardAttributeFilter,
    getSelectedElementsCount,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterWithDimension,
    isDashboardCommonDateFilter,
    isRelativeDashboardDateFilter,
    isAbsoluteDashboardDateFilter,
    isDashboardDateFilterReference,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newRelativeDashboardDateFilter,
    isFilterContextItem,
    dashboardFilterLocalIdentifier,
    dashboardFilterObjRef,
} from "./dashboard/filterContext.js";

export type { IWidgetAlert, IWidgetAlertBase, IWidgetAlertDefinition } from "./dashboard/alert.js";
export { isWidgetAlert, isWidgetAlertDefinition } from "./dashboard/alert.js";

export type {
    DrillDefinition,
    DrillOrigin,
    DrillOriginType,
    DrillTransition,
    DrillType,
    IDrill,
    IDrillDownReference,
    IDateHierarchyReference,
    IAttributeHierarchyReference,
    IDrillFromAttribute,
    IDrillFromMeasure,
    IDrillOrigin,
    IDrillTarget,
    IDrillToAttributeUrl,
    IDrillToAttributeUrlTarget,
    IDrillToCustomUrl,
    IDrillToCustomUrlTarget,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    InsightDrillDefinition,
    KpiDrillDefinition,
    ICrossFiltering,
    IKeyDriveAnalysis,
} from "./dashboard/drill.js";
export {
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    isAttributeHierarchyReference,
    isDateHierarchyReference,
    isCrossFiltering,
    isKeyDriveAnalysis,
    drillDownReferenceHierarchyRef,
    drillDownReferenceAttributeRef,
} from "./dashboard/drill.js";

export type {
    IBaseWidget,
    IDrillableWidget,
    IFilterableWidget,
    IWidgetDescription,
    IDrillDownIntersectionIgnoredAttributes,
} from "./dashboard/baseWidget.js";
export { BuiltInWidgetTypes } from "./dashboard/baseWidget.js";

export type {
    IKpi,
    IKpiBase,
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
    IKpiWithPopComparison,
    IKpiWithPreviousPeriodComparison,
    IKpiWithComparison,
    IKpiWithoutComparison,
} from "./dashboard/kpi.js";
export { isKpiWithComparison, isKpiWithoutComparison, isKpi } from "./dashboard/kpi.js";

export type {
    AnalyticalWidgetType,
    IAnalyticalWidget,
    IKpiWidget,
    IKpiWidgetBase,
    IKpiWidgetDefinition,
    IKpiWidgetConfiguration,
    IKpiWidgetDescriptionConfiguration,
    KpiWidgetDescriptionSourceType,
    IInsightWidget,
    IInsightWidgetBase,
    IInsightWidgetDefinition,
    IInsightWidgetConfiguration,
    IInsightWidgetDescriptionConfiguration,
    InsightWidgetDescriptionSourceType,
    IRichTextWidget,
    IRichTextWidgetBase,
    IRichTextWidgetDefinition,
    IVisualizationSwitcherWidget,
    IVisualizationSwitcherWidgetBase,
    IVisualizationSwitcherWidgetDefinition,
} from "./dashboard/analyticalWidgets.js";

export type {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogDateAttribute,
    ICatalogItemBase,
    IGroupableCatalogItemBase,
    GroupableCatalogItem,
    ICatalogDateAttributeHierarchy,
} from "./ldm/catalog/index.js";
export {
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
    isCatalogDateAttributeHierarchy,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogDateDataset,
    isCatalogDateAttribute,
    catalogItemMetadataObject,
    getHierarchyRef,
    getHierarchyTitle,
    getHierarchyAttributes,
} from "./ldm/catalog/index.js";

export type {
    IAttributeDisplayFormMetadataObject,
    IAttributeDisplayFormGeoAreaConfig,
    AttributeDisplayFormType,
    IAttributeMetadataObject,
    IDataSetMetadataObject,
    IVariableMetadataObject,
    IFactMetadataObject,
    IMetadataObjectDefinition,
    IMeasureMetadataObject,
    IMeasureMetadataObjectBase,
    IMeasureMetadataObjectDefinition,
    IMetadataObject,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    MetadataObject,
    IDashboardMetadataObject,
    IAttributeHierarchyMetadataObject,
    IDateHierarchyTemplate,
    IMdObject,
    IMdObjectBase,
    IMdObjectDefinition,
    IMdObjectIdentity,
    ToMdObjectDefinition,
} from "./ldm/metadata/index.js";
export {
    isAttributeDisplayFormMetadataObject,
    isAttributeMetadataObject,
    isDataSetMetadataObject,
    isVariableMetadataObject,
    isFactMetadataObject,
    isMeasureMetadataObject,
    isMeasureMetadataObjectDefinition,
    isMetadataObject,
    metadataObjectId,
    isDashboardMetadataObject,
    attributeDisplayFormMetadataObjectAttributeRef,
    attributeDisplayFormMetadataObjectRef,
    attributeDisplayFormMetadataObjectTitle,
    isAttributeHierarchyMetadataObject,
    isMdObject,
    isMdObjectDefinition,
} from "./ldm/metadata/index.js";

export type {
    DataColumnType,
    DatasetLoadStatus,
    IDataColumnBody,
    IDataColumn,
    IDataHeader,
    IDatasetLoadInfo,
    IDatasetUser,
    IDataset,
    IDatasetBody,
} from "./ldm/datasets/index.js";

export type { IAttributeElement } from "./ldm/attributeElement.js";

export type { IWidget, IWidgetDefinition } from "./dashboard/widget.js";
export {
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
    isRichTextWidget,
    isRichTextWidgetDefinition,
    isVisualizationSwitcherWidget,
    isVisualizationSwitcherWidgetDefinition,
} from "./dashboard/widget.js";

export type {
    IDashboardAttachment,
    IWidgetAttachment,
    IExportOptions,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
    IScheduledMailBase,
} from "./dashboard/scheduledMail.js";
export { isDashboardAttachment, isWidgetAttachment } from "./dashboard/scheduledMail.js";

export type {
    IUser,
    IUserGroup,
    IWorkspaceUser,
    IOrganizationUser,
    IOrganizationUserGroup,
} from "./user/index.js";
export { userFullName, isIOrganizationUser, isIOrganizationUserGroup } from "./user/index.js";

export type {
    IDashboardLayout,
    IDashboardWidget,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
    IDashboardLayoutWidget,
    IDashboardLayoutConfiguration,
    IDashboardLayoutSectionsConfiguration,
    IDashboardLayoutContainerDirection,
    ScreenSize,
} from "./dashboard/layout.js";
export {
    isDashboardLayout,
    isDashboardLayoutSection,
    isDashboardLayoutItem,
    isDashboardWidget,
} from "./dashboard/layout.js";

export type {
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    ListedDashboardAvailability,
    IDashboardBase,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfigItem,
    DashboardAttributeFilterConfigMode,
    IDashboardDateFilterAddedPresets,
    IDashboardPluginBase,
    IDashboardPlugin,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    IAccessControlAware,
    ShareStatus,
    SharePermission,
    IDashboardPermissions,
    IExistingDashboard,
    IDashboardTab,
} from "./dashboard/dashboard.js";
export {
    DashboardDateFilterConfigModeValues,
    DashboardAttributeFilterConfigModeValues,
    isDashboard,
    isDashboardDefinition,
    isListedDashboard,
    isDashboardTab,
} from "./dashboard/dashboard.js";

export type {
    ISeparators,
    ISettings,
    PlatformEdition,
    IWhiteLabeling,
    IAlertDefault,
    WeekStart,
    IOpenAiConfig,
    ILlmEndpoint,
    DashboardFiltersApplyMode,
    EarlyAccessFeatureContext,
    EarlyAccessFeatureStatus,
    IEarlyAccessFeatureConfig,
    IEarlyAccessFeaturesConfig,
    IProductionFeatureConfig,
    IProductionFeaturesConfig,
} from "./settings/index.js";

export { isSeparators } from "./settings/index.js";

export type { IWorkspaceUserGroup } from "./userGroup/index.js";

export type {
    ThemeFontUri,
    ThemeColor,
    IThemeColorFamily,
    IThemeComplementaryPalette,
    IThemeWidgetTitle,
    IThemeTypography,
    IThemeFontsDef,
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
    IThemeMetadataObject,
    IThemeDefinition,
    IThemeModal,
    IThemeModalTitle,
    IThemeTooltip,
    IThemeImages,
    IThemeMessage,
    IThemeMessageVariant,
    IThemeToastMessage,
    IThemeToastMessageVariant,
    ImageUri,
    IThemeAxis,
    IThemeChartTooltip,
    IThemeDataLabel,
} from "./theme/index.js";

export type { IWorkspacePermissions, WorkspacePermission } from "./permissions/index.js";

export type {
    DataValue,
    ForecastDataValue,
    IGeoJsonFeature,
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
    IColorDescriptor,
    IColorDescriptorItem,
} from "./execution/results/index.js";
export {
    isColorDescriptor,
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
    geoFeatureKey,
} from "./execution/results/index.js";

export type {
    AccessGranteeDetail,
    IAccessGrantee,
    IUserAccess,
    IUserAccessGrantee,
    IUserGroupAccess,
    IUserGroupAccessGrantee,
    IGranularAccessGrantee,
    AccessGranularPermission,
    IGranteeGranularity,
    IAvailableAccessGrantee,
    IAvailableUserAccessGrantee,
    IAvailableUserGroupAccessGrantee,
    IGranularUserAccess,
    IGranularUserGroupAccess,
    IGranularRulesAccess,
    IGranularUserAccessGrantee,
    IGranularUserGroupAccessGrantee,
    IGranularRulesAccessGrantee,
    WorkspaceAccessPermission,
    IWorkspaceAccess,
    IUserWorkspaceAccessGrantee,
    IUserGroupWorkspaceAccessGrantee,
} from "./accessControl/index.js";
export {
    isUserAccess,
    isUserAccessGrantee,
    isUserGroupAccess,
    isUserGroupAccessGrantee,
    isGranularAccess,
    isAvailableUserGroupAccessGrantee,
    isAvailableUserAccessGrantee,
    isGranularAccessGrantee,
    isGranularUserAccessGrantee,
    isGranularUserGroupAccessGrantee,
    isGranularUserAccess,
    isGranularUserGroupAccess,
    isGranularRulesAccessGrantee,
    isUserWorkspaceAccessGrantee,
    isUserGroupWorkspaceAccessGrantee,
} from "./accessControl/index.js";

export type {
    IOrganizationDescriptor,
    IOrganizationDescriptorUpdate,
    IWorkspacePermissionAssignment,
    IAssignedWorkspace,
    AssignedWorkspacePermission,
    IOrganizationPermissionAssignment,
    OrganizationPermissionAssignment,
    IOrganizationAssignee,
    AssignedDataSourcePermission,
    IAssignedDataSource,
    IDataSourcePermissionAssignment,
} from "./organization/index.js";
export {
    AssignedWorkspacePermissionValue,
    OrganizationPermissionAssignmentValue,
    AssignedDataSourcePermissionValue,
    isAssignedWorkspacePermission,
} from "./organization/index.js";
export type { IEntitlementsName, IEntitlementDescriptor } from "./entitlements/index.js";
export type { DataSourceType, IDataSourceIdentifierDescriptor } from "./dataSources/index.js";

export type {
    IExportDefinitionMetadataObject,
    IExportDefinitionBase,
    IExportDefinitionDashboardSettings,
    IExportDefinitionDashboardRequestPayload,
    IExportDefinitionVisualizationObjectSettings,
    IExportDefinitionVisualizationObjectRequestPayload,
    IExportDefinitionRequestPayload,
    IExportDefinitionDashboardContent,
    IExportDefinitionVisualizationObjectContent,
    IExportDefinitionMetadataObjectDefinition,
    IExportResult,
    IExportResultStatus,
    DashboardAttachmentType,
    WidgetAttachmentType,
} from "./exports/index.js";
export {
    exportDefinitionTitle,
    exportDefinitionCreated,
    exportDefinitionUpdated,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "./exports/index.js";

export type {
    IWorkspaceDataFilter,
    IWorkspaceDataFilterDefinition,
    IWorkspaceDataFilterSetting,
} from "./dataFilter/index.js";
export type {
    IAutomationMetadataObjectBase,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IAutomationSchedule,
    IAutomationRecipient,
    IAutomationRecipientBase,
    IAutomationRecipientType,
    IAutomationUserGroupRecipient,
    IAutomationUserRecipient,
    IAutomationLastRunStatus,
    IAutomationState,
    IAutomationExternalRecipient,
    IAutomationUnknownRecipient,
    IAutomationAlert,
    IAutomationAlertCondition,
    IAutomationAlertExecutionDefinition,
    IAlertComparisonOperator,
    IAlertTriggerMode,
    IAlertTriggerState,
    IAutomationAlertTrigger,
    IAutomationAlertComparisonCondition,
    IAlertRelativeOperator,
    IAlertRelativeArithmeticOperator,
    IAutomationAlertRelativeCondition,
    IAutomationDetails,
    IAutomationVisibleFilter,
    AutomationEvaluationMode,
    IAlertAnomalyDetectionSensitivity,
    IAlertAnomalyDetectionGranularity,
    IAutomationAnomalyDetectionCondition,
} from "./automations/index.js";
export {
    isAutomationMetadataObject,
    isAutomationMetadataObjectDefinition,
    isAutomationUserGroupRecipient,
    isAutomationUserRecipient,
    isAutomationExternalUserRecipient,
    isAutomationUnknownUserRecipient,
} from "./automations/index.js";

export type {
    IMemoryItemDefinition,
    IMemoryItemMetadataObject,
    MemoryItemStrategy,
} from "./ldm/metadata/memoryItem/index.js";
export type {
    ISemanticSearchResult,
    ISemanticSearchResultItem,
    ISemanticSearchRelationship,
} from "./genAI/semanticSearch.js";
export { isSemanticSearchResultItem, isSemanticSearchRelationship } from "./genAI/semanticSearch.js";

export type {
    IGenAIChatInteraction,
    IGenAIUserContext,
    IGenAIChatRouting,
    IGenAICreatedVisualizations,
    IGenAIFoundObjects,
    IGenAIVisualization,
    IGenAIVisualizationDimension,
    IGenAIVisualizationMetric,
    IGenAIActiveObject,
    IGenAISuggestion,
    IGenAIChangeAnalysisParams,
    GenAIChatRoutingUseCase,
    GenAIChatInteractionUserFeedback,
    GenAIChatInteractionUserVisualisation,
    GenAIChatRole,
    GenAIVisualizationType,
    GenAIMetricAggregation,
    GenAIMetricType,
    GenAIFilter,
    GenAIPositiveAttributeFilter,
    GenAINegativeAttributeFilter,
    GenAIAbsoluteDateFilter,
    GenAIRelativeDateFilter,
    GenAIDateGranularity,
    GenAIRankingFilter,
} from "./genAI/chat.js";

export type { GenAIObjectType } from "./genAI/common.js";

export type {
    ILlmEndpointBase,
    ILlmEndpointOpenAI,
    LlmEndpointOpenAIPatch,
    LlmEndpointTestResults,
} from "./llmEndpoints/index.js";

export {
    type ISemanticQualityReport,
    type ISemanticQualityIssue,
    type ISemanticQualityIssueObject,
    type ISemanticQualityIssueDetail,
    type ISemanticQualityIssuesCalculation,
    type SemanticQualityIssueAttributeName,
    type SemanticQualityIssueSeverity,
    type SemanticQualityIssueCode,
    type SemanticQualityIssuesCalculationStatus,
    SemanticQualityIssueCodeValues,
    SemanticQualityIssueSeverityOrder,
} from "./genAI/quality.js";
