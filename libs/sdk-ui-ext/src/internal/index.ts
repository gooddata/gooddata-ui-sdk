// (C) 2019-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

export { Axis } from "./constants/axis.js";
export { DrillablePredicatesUtils } from "./utils/drillablePredicates.js";
export { LabelRotationControl } from "./components/configurationControls/axis/LabelRotationControl.js";
export { LabelSubsection } from "./components/configurationControls/axis/LabelSubsection.js";
export { NamePositionControl } from "./components/configurationControls/axis/NamePositionControl.js";
export { NameSubsection } from "./components/configurationControls/axis/NameSubsection.js";
export { ColorDropdown } from "./components/configurationControls/colors/colorDropdown/ColorDropdown.js";
export { ColoredItemContent } from "./components/configurationControls/colors/coloredItemsList/ColoredItemContent.js";
export { LegendSection } from "./components/configurationControls/legend/LegendSection.js";
export { MinMaxControl } from "./components/configurationControls/MinMaxControl.js";

export { BaseVisualization, type IBaseVisualizationProps } from "./components/BaseVisualization.js";

export {
    DefaultVisualizationCatalog,
    FullVisualizationCatalog,
    type IVisualizationCatalog,
} from "./components/VisualizationCatalog.js";
export { resolveMessages, DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "./utils/translations.js";
export { createIntlMock } from "./tests/testIntlProvider.js";
export {
    type IVisualization,
    type IVisConstruct,
    type IVisCallbacks,
    type IVisProps,
    type IVisualizationProperties,
    type IVisualizationOptions,
    type IGdcConfig,
    type PluggableVisualizationErrorType,
    type PluggableVisualizationError,
    type IExtendedReferencePoint,
    type IBucketItem,
    type IReferencePoint,
    type IFilters,
    type IFiltersBucketItem,
    type IMeasureValueFilter,
    type IRankingFilter,
    type IAttributeFilter,
    type IDateFilter,
    type IDrillDownContext,
    type IDrillDownDefinition,
    type ICustomProps,
    type IConfigurationPanelRenderers,
    ConfigPanelClassName,
    PluggableVisualizationErrorCodes,
    InvalidBucketsSdkError,
    EmptyAfmSdkError,
    isPluggableVisualizationError,
    isEmptyAfm,
    isInvalidBuckets,
    isDrillDownDefinition,
    InvalidColumnsSdkError,
    isInvalidColumns,
} from "./interfaces/Visualization.js";

export {
    isDateFilter,
    isMeasureValueFilter,
    isAttributeFilter,
    isRankingFilter,
} from "./utils/bucketHelper.js";
export { createInternalIntl, InternalIntlWrapper } from "./utils/internalIntlProvider.js";

export {
    type IVisualizationSizeInfo,
    type ISizeInfo,
    type IVisualizationDefaultSizeInfo,
    type ISizeInfoDefault,
    type IVisualizationMeta,
    isSizeInfo,
    isSizeInfoDefault,
    isVisualizationDefaultSizeInfo,
} from "./interfaces/VisualizationDescriptor.js";
export type { IFluidLayoutDescriptor, ILayoutDescriptor, LayoutType } from "./interfaces/LayoutDescriptor.js";

export type { ISortConfig, IAvailableSortsGroup } from "./interfaces/SortConfig.js";

export { addIntersectionFiltersToInsight } from "./components/pluggableVisualizations/drillDownUtil.js";
export {
    DASHBOARD_LAYOUT_DEFAULT_VIS_HEIGHT_PX,
    MAX_VISUALIZATION_HEIGHT,
    MAX_NEW_VISUALIZATION_HEIGHT,
    MIN_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
    MIN_VISUALIZATION_HEIGHT_TABLE_REPEATER_FLEXIBLE_LAYOUT,
    MIDDLE_VISUALIZATION_HEIGHT,
    MIDDLE_VISUALIZATION_HEIGHT_FLEXIBLE_LAYOUT,
    MIN_VISUALIZATION_WIDTH,
    MIN_RICH_TEXT_WIDTH,
    INSIGHT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
} from "./components/pluggableVisualizations/constants.js";
export { LabelFormatControl } from "./components/configurationControls/axis/LabelFormatControl.js";

export { FluidLayoutDescriptor, fluidLayoutDescriptor } from "./FluidLayoutDescriptor.js";

export {
    EmbedInsightDialog,
    type IEmbedInsightDialogProps,
} from "./components/dialogs/embedInsightDialog/EmbedInsightDialog.js";

export type { IInsightTitleProps, IInsightViewProps } from "./interfaces/InsightView.js";

export {
    type ITabsIds,
    type IUsePagedDropdownConfig,
    type IUsePagedDropdownResult,
    useInsightPagedList,
} from "./components/insightList/useInsightPagedList.js";
