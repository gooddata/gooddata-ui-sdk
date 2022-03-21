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

export { AttributeColorStrategy } from "./coloring/attribute";
export {
    ColorStrategy,
    getAttributeColorAssignment,
    IColorStrategy,
    ICreateColorAssignmentReturnValue,
    isValidMappedColor,
} from "./coloring/base";
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
} from "./coloring/color";

export { IColorMapping } from "./coloring/types";

export { Legend, ILegendProps } from "./legend/Legend";

export { StaticLegend, IStaticLegendProps } from "./legend/StaticLegend";

export { PopUpLegend, IPopUpLegendProps } from "./legend/PopUpLegend/PopUpLegend";

export { FluidLegend, IFluidLegendProps } from "./legend/FluidLegend";

export { HeatmapLegend, IHeatmapLegendProps } from "./legend/HeatmapLegend";

export { ColorLegend, IColorLegendProps } from "./legend/ColorLegend";

export { IPagingProps, ButtonsOrientationType, Paging } from "./legend/Paging";

export { IHeadlinePaginationProps, HeadlinePagination } from "./compactSize/HeadlinePagination";

export { formatLegendLabel, shouldShowFluid, FLUID_LEGEND_THRESHOLD } from "./legend/helpers";

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
} from "./legend/types";

export { fixEmptyHeaderItems } from "./utils/fixEmptyHeaderItems";

export { shouldRenderPagination, calculateHeadlineHeightFontSize } from "./utils/calculateCustomHeight";
export { getHeadlineResponsiveClassName } from "./utils/headlineResponsiveClassName";

export { getLegendDetails, ILegendDetails, ILegendDetailOptions } from "./legend/PopUpLegend/helpers";
