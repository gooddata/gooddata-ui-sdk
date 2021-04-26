// (C) 2019-2021 GoodData Corporation

/*
 *
 */

export { AttributeColorStrategy } from "./coloring/attribute";
export {
    ColorStrategy,
    getAtributeColorAssignment,
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

//
//
//

export { Legend, ILegendProps } from "./legend/Legend";

export { StaticLegend, IStaticLegendProps } from "./legend/StaticLegend";

export { FluidLegend, IFluidLegendProps } from "./legend/FluidLegend";

export { HeatmapLegend, IHeatmapLegendProps } from "./legend/HeatmapLegend";

export { ColorLegend, IColorLegendProps } from "./legend/ColorLegend";

export { IPagingProps, Paging } from "./legend/Paging";

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
} from "./legend/types";

export { fixEmptyHeaderItems } from "./utils/fixEmptyHeaderItems";

export { shouldRenderPagination, calculateHeadlineHeightFontSize } from "./utils/calculateCustomHeight";
export { getHeadlineResponsiveClassName } from "./utils/headlineResponsiveClassName";
