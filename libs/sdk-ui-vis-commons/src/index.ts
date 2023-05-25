// (C) 2019-2022 GoodData Corporation

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
    getAttributeColorAssignment,
    IColorStrategy,
    ICreateColorAssignmentReturnValue,
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
} from "./coloring/color.js";

export { IColorMapping } from "./coloring/types.js";

export { Legend, ILegendProps } from "./legend/Legend.js";

export { StaticLegend, IStaticLegendProps } from "./legend/StaticLegend.js";

export { PopUpLegend, IPopUpLegendProps } from "./legend/PopUpLegend/PopUpLegend.js";

export { FluidLegend, IFluidLegendProps } from "./legend/FluidLegend.js";

export { HeatmapLegend, IHeatmapLegendProps } from "./legend/HeatmapLegend.js";

export { ColorLegend, IColorLegendProps } from "./legend/ColorLegend.js";

export { IPagingProps, ButtonsOrientationType, Paging } from "./legend/Paging.js";

export { IHeadlinePaginationProps, HeadlinePagination } from "./compactSize/HeadlinePagination.js";

export { formatLegendLabel, shouldShowFluid, FLUID_LEGEND_THRESHOLD } from "./legend/helpers.js";

export {
    DEFAULT_LEGEND_CONFIG,
    LegendPosition,
    SupportedLegendPositions,
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
} from "./legend/types.js";

export { fixEmptyHeaderItems } from "./utils/fixEmptyHeaderItems.js";
export { valueWithEmptyHandling } from "./utils/valueWithEmptyHandling.js";

export { shouldRenderPagination, calculateHeadlineHeightFontSize } from "./utils/calculateCustomHeight.js";
export { getHeadlineResponsiveClassName } from "./utils/headlineResponsiveClassName.js";

export { getLegendDetails, ILegendDetails, ILegendDetailOptions } from "./legend/PopUpLegend/helpers.js";
