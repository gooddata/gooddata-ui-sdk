// (C) 2019-2026 GoodData Corporation

/**
 * This package provides functions commonly used when building visualizations.
 *
 * @remarks
 * This package is mainly used internally by other `@gooddata/sdk-ui-*` packages, and we do not recommend using
 * it directly outside of GoodData because its API can change at any time.
 *
 * @packageDocumentation
 */

export { AttributeColorStrategy } from "./coloring/attribute.js";
export {
    ColorStrategy,
    type IColorStrategy,
    type ICreateColorAssignmentReturnValue,
    getAttributeColorAssignment,
    isValidMappedColor,
} from "./coloring/base.js";
export {
    getColorByGuid,
    getColorFromMapping,
    getColorMappingPredicate,
    getColorPaletteFromColors,
    getLighterColor,
    getLighterColorFromRGB,
    getRgbString,
    getRgbStringFromRGB,
    isCustomPalette,
    normalizeColorToRGB,
    parseRGBColorCode,
    getValidColorPalette,
    ColorUtils,
    parseRGBString,
    isPatternObject,
    getRgbFromWebColor,
    getContrastRatio,
} from "./coloring/color.js";

export type {
    IColorMapping,
    ChartFillType,
    IPatternOptionsObject,
    IPatternObject,
} from "./coloring/types.js";

export { Legend, type ILegendProps } from "./legend/Legend.js";

export { StaticLegend, type IStaticLegendProps } from "./legend/StaticLegend.js";

export { PopUpLegend, type IPopUpLegendProps } from "./legend/PopUpLegend/PopUpLegend.js";

export { FluidLegend, type IFluidLegendProps } from "./legend/FluidLegend.js";

export { HeatmapLegend, type IHeatmapLegendProps } from "./legend/HeatmapLegend.js";

export { ColorLegend, type IColorLegendProps } from "./legend/ColorLegend.js";

export { Paging, type IPagingProps, type ButtonsOrientationType } from "./legend/Paging.js";

export { HeadlinePagination, type IHeadlinePaginationProps } from "./compactSize/HeadlinePagination.js";

export { formatLegendLabel, shouldShowFluid, FLUID_LEGEND_THRESHOLD } from "./legend/helpers.js";

export {
    type PositionType,
    type IColorLegendItem,
    type IGeoCategoryLegendItem,
    type IGeoChartLegendData,
    type IHeatmapLegendItem,
    type ILegendOptions,
    type IPushpinCategoryLegendItem,
    type IRange,
    type LegendOptionsItemType,
    type ItemBorderRadiusPredicate,
    type IColorLegendSize,
    type ISeriesItem,
    type ILegendGroup,
    type IGroupedSeries,
    type IGroupedSeriesItem,
    type ISeriesItemMetric,
    type ISeriesItemSeparator,
    type ISeriesItemAxisIndicator,
    DEFAULT_LEGEND_CONFIG,
    LegendPosition,
    SupportedLegendPositions,
    isLegendGroup,
    isSeriesItemMetric,
    isSeriesItemSeparator,
    isSeriesItemAxisIndicator,
    LEGEND_AXIS_INDICATOR,
    LEGEND_SEPARATOR,
    LEGEND_GROUP,
} from "./legend/types.js";

export { fixEmptyHeaderItems } from "./utils/fixEmptyHeaderItems.js";
export { valueWithEmptyHandling } from "./utils/valueWithEmptyHandling.js";

export { shouldRenderPagination, calculateHeadlineHeightFontSize } from "./utils/calculateCustomHeight.js";
export { getHeadlineResponsiveClassName } from "./utils/headlineResponsiveClassName.js";

export {
    getLegendDetails,
    type ILegendDetails,
    type ILegendDetailOptions,
} from "./legend/PopUpLegend/helpers.js";

export {
    PATTERN_FILLS,
    getPatternFillByIndex,
    getPatternFillByName,
    getPatternFill,
    type IPatternFill,
    type PatternFillName,
    type IChartFillConfig,
} from "./coloring/patternFills.js";
export { PatternFill, type IPatternFillProps } from "./coloring/PatternFill.js";
