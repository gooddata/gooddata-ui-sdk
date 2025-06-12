// (C) 2019-2025 GoodData Corporation

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
export type { IColorStrategy, ICreateColorAssignmentReturnValue } from "./coloring/base.js";
export { ColorStrategy, getAttributeColorAssignment, isValidMappedColor } from "./coloring/base.js";
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
} from "./coloring/color.js";

export type { IColorMapping } from "./coloring/types.js";

export type { ILegendProps } from "./legend/Legend.js";
export { Legend } from "./legend/Legend.js";

export type { IStaticLegendProps } from "./legend/StaticLegend.js";
export { StaticLegend } from "./legend/StaticLegend.js";

export type { IPopUpLegendProps } from "./legend/PopUpLegend/PopUpLegend.js";
export { PopUpLegend } from "./legend/PopUpLegend/PopUpLegend.js";

export type { IFluidLegendProps } from "./legend/FluidLegend.js";
export { FluidLegend } from "./legend/FluidLegend.js";

export type { IHeatmapLegendProps } from "./legend/HeatmapLegend.js";
export { HeatmapLegend } from "./legend/HeatmapLegend.js";

export type { IColorLegendProps } from "./legend/ColorLegend.js";
export { ColorLegend } from "./legend/ColorLegend.js";

export type { IPagingProps, ButtonsOrientationType } from "./legend/Paging.js";
export { Paging } from "./legend/Paging.js";

export type { IHeadlinePaginationProps } from "./compactSize/HeadlinePagination.js";
export { HeadlinePagination } from "./compactSize/HeadlinePagination.js";

export { formatLegendLabel, shouldShowFluid, FLUID_LEGEND_THRESHOLD } from "./legend/helpers.js";

export type {
    PositionType,
    IBaseLegendItem,
    IColorLegendItem,
    IGeoChartLegendData,
    IHeatmapLegendItem,
    ILegendOptions,
    IPushpinCategoryLegendItem,
    IRange,
    LegendOptionsItemType,
    ItemBorderRadiusPredicate,
    IColorLegendSize,
    ISeriesItem,
} from "./legend/types.js";
export { DEFAULT_LEGEND_CONFIG, LegendPosition, SupportedLegendPositions } from "./legend/types.js";

export { fixEmptyHeaderItems } from "./utils/fixEmptyHeaderItems.js";
export { valueWithEmptyHandling } from "./utils/valueWithEmptyHandling.js";

export { shouldRenderPagination, calculateHeadlineHeightFontSize } from "./utils/calculateCustomHeight.js";
export { getHeadlineResponsiveClassName } from "./utils/headlineResponsiveClassName.js";

export type { ILegendDetails, ILegendDetailOptions } from "./legend/PopUpLegend/helpers.js";
export { getLegendDetails } from "./legend/PopUpLegend/helpers.js";
