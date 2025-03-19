// (C) 2019-2024 GoodData Corporation
import * as Axis from "./constants/axis.js";
import * as DrillablePredicatesUtils from "./utils/drillablePredicates.js";
import LabelRotationControl from "./components/configurationControls/axis/LabelRotationControl.js";
import LabelSubsection from "./components/configurationControls/axis/LabelSubsection.js";
import NamePositionControl from "./components/configurationControls/axis/NamePositionControl.js";
import NameSubsection from "./components/configurationControls/axis/NameSubsection.js";
import MinMaxControl from "./components/configurationControls/MinMaxControl.js";
import ColorDropdown from "./components/configurationControls/colors/colorDropdown/ColorDropdown.js";
import ColoredItemContent from "./components/configurationControls/colors/coloredItemsList/ColoredItemContent.js";
import LegendSection from "./components/configurationControls/legend/LegendSection.js";
export {
    Axis,
    DrillablePredicatesUtils,
    LabelRotationControl,
    LabelSubsection,
    NamePositionControl,
    NameSubsection,
    MinMaxControl,
    ColorDropdown,
    ColoredItemContent,
    LegendSection,
};

export type { IBaseVisualizationProps } from "./components/BaseVisualization.js";
export { BaseVisualization } from "./components/BaseVisualization.js";

export type { IVisualizationCatalog } from "./components/VisualizationCatalog.js";
export { DefaultVisualizationCatalog, FullVisualizationCatalog } from "./components/VisualizationCatalog.js";
export { translations } from "./utils/translations.js";

export type {
    IVisualization,
    IVisConstruct,
    IVisCallbacks,
    IVisProps,
    IVisualizationProperties,
    IVisualizationOptions,
    IGdcConfig,
    PluggableVisualizationErrorType,
    PluggableVisualizationError,
    IExtendedReferencePoint,
    IBucketItem,
    IReferencePoint,
    IFilters,
    IFiltersBucketItem,
    IMeasureValueFilter,
    IRankingFilter,
    IAttributeFilter,
    IDateFilter,
    IDrillDownContext,
    IDrillDownDefinition,
    ICustomProps,
    IConfigurationPanelRenderers,
} from "./interfaces/Visualization.js";
export {
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

export type {
    IVisualizationSizeInfo,
    ISizeInfo,
    IVisualizationDefaultSizeInfo,
    ISizeInfoDefault,
    IVisualizationMeta,
} from "./interfaces/VisualizationDescriptor.js";
export type { IFluidLayoutDescriptor, ILayoutDescriptor, LayoutType } from "./interfaces/LayoutDescriptor.js";

export type { ISortConfig, IAvailableSortsGroup } from "./interfaces/SortConfig.js";

export { addIntersectionFiltersToInsight } from "./components/pluggableVisualizations/drillDownUtil.js";
export * from "./components/pluggableVisualizations/constants.js";
export { LabelFormatControl } from "./components/configurationControls/axis/LabelFormatControl.js";

export * from "./FluidLayoutDescriptor.js";

export { EmbedInsightDialog } from "./components/dialogs/embedInsightDialog/EmbedInsightDialog.js";

export type { IEmbedInsightDialogProps } from "./components/dialogs/embedInsightDialog/EmbedInsightDialog.js";

export type { IInsightTitleProps, IInsightViewProps } from "./interfaces/InsightView.js";

export { unmountComponentsAtNodes } from "./utils/domHelper.js";
