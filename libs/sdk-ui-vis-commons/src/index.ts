// (C) 2019-2020 GoodData Corporation

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
} from "./coloring/color";

export { IColorMapping } from "./coloring/types";

import ColorUtils from "./coloring/color";
export { ColorUtils };
