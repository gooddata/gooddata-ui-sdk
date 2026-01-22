// (C) 2019-2026 GoodData Corporation

import { LabelRotationControl } from "./components/configurationControls/axis/LabelRotationControl.js";
import { LabelSubsection } from "./components/configurationControls/axis/LabelSubsection.js";
import { NamePositionControl } from "./components/configurationControls/axis/NamePositionControl.js";
import { NameSubsection } from "./components/configurationControls/axis/NameSubsection.js";
import { ColorDropdown } from "./components/configurationControls/colors/colorDropdown/ColorDropdown.js";
import { ColoredItemContent } from "./components/configurationControls/colors/coloredItemsList/ColoredItemContent.js";
import { LegendSection } from "./components/configurationControls/legend/LegendSection.js";
import { MinMaxControl } from "./components/configurationControls/MinMaxControl.js";
import * as Axis from "./constants/axis.js";
import * as DrillablePredicatesUtils from "./utils/drillablePredicates.js";
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
export * from "./components/pluggableVisualizations/constants.js";
export { LabelFormatControl } from "./components/configurationControls/axis/LabelFormatControl.js";

export * from "./FluidLayoutDescriptor.js";

export {
    EmbedInsightDialog,
    type IEmbedInsightDialogProps,
} from "./components/dialogs/embedInsightDialog/EmbedInsightDialog.js";

export type { IInsightTitleProps, IInsightViewProps } from "./interfaces/InsightView.js";
