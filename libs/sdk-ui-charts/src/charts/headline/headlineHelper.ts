// (C) 2023-2026 GoodData Corporation

import { defineMessage } from "react-intl";

import {
    type IColor,
    type IColorPalette,
    type IRgbColorValue,
    isColorFromPalette,
} from "@gooddata/sdk-model";
import { getColorByGuid, isValidMappedColor } from "@gooddata/sdk-ui-vis-commons";

import { CalculateAs, type CalculationType } from "../../interfaces/comparison.js";

/**
 * @internal
 */
interface ICalculationDefaultValue {
    defaultLabelKeys: IDefaultLabelKeys;
    defaultFormat: string | null;
    defaultSubFormat: string | null;
}

/**
 * @internal
 */
interface IDefaultLabelKeys {
    nonConditionalKey: string;
    positiveKey?: string;
    negativeKey?: string;
    equalsKey?: string;
}

/**
 * @internal
 */
enum ComparisonColorType {
    POSITIVE = "positive",
    NEGATIVE = "negative",
    EQUALS = "equals",
}

/**
 * @internal
 */
const CALCULATION_VALUES_DEFAULT: Record<CalculationType, ICalculationDefaultValue> = {
    change: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.change" }).id,
            positiveKey: defineMessage({ id: "visualizations.headline.comparison.title.change.positive" }).id,
            negativeKey: defineMessage({ id: "visualizations.headline.comparison.title.change.negative" }).id,
            equalsKey: defineMessage({ id: "visualizations.headline.comparison.title.change.equals" }).id,
        },
        defaultSubFormat: null,
        defaultFormat: "#,##0%",
    },
    ratio: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.ratio" }).id,
        },
        defaultSubFormat: null,
        defaultFormat: "#,##0%",
    },
    change_difference: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.change" }).id,
            positiveKey: defineMessage({ id: "visualizations.headline.comparison.title.change.positive" }).id,
            negativeKey: defineMessage({ id: "visualizations.headline.comparison.title.change.negative" }).id,
            equalsKey: defineMessage({ id: "visualizations.headline.comparison.title.change.equals" }).id,
        },
        defaultFormat: "#,##0%",
        defaultSubFormat: null,
    },
    difference: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.difference" })
                .id,
            positiveKey: defineMessage({ id: "visualizations.headline.comparison.title.difference.positive" })
                .id,
            negativeKey: defineMessage({ id: "visualizations.headline.comparison.title.difference.negative" })
                .id,
            equalsKey: defineMessage({ id: "visualizations.headline.comparison.title.difference.equals" }).id,
        },
        defaultFormat: null,
        defaultSubFormat: null,
    },
};

const DEFAULT_COMPARISON_COLORS_INDEX: Record<ComparisonColorType, number> = {
    [ComparisonColorType.POSITIVE]: 0,
    [ComparisonColorType.NEGATIVE]: 1,
    [ComparisonColorType.EQUALS]: 2,
};

/**
 * @internal
 */
const DEFAULT_COMPARISON_PALETTE: IColorPalette = [
    {
        guid: ComparisonColorType.POSITIVE,
        fill: { r: 0, g: 193, b: 141 },
    },
    {
        guid: ComparisonColorType.NEGATIVE,
        fill: { r: 229, g: 77, b: 64 },
    },
    {
        guid: ComparisonColorType.EQUALS,
        fill: { r: 148, g: 161, b: 173 },
    },
];

/**
 * Get comparison format
 *
 * @remarks
 * We offer the option to inherit the format with a null value. When the provided format is null,
 * it indicates the user's preference to utilize the inherit format.
 *
 * If the format is undefined, the default format will be used.
 *
 * @internal
 */
const getComparisonFormat = (
    providedFormat: string | null | undefined,
    defaultFormat: string | null,
): string | null => {
    return providedFormat === undefined ? defaultFormat : providedFormat;
};

/**
 * Method to retrieve default values corresponding to the calculation type.
 *
 * @internal
 */
const getCalculationValuesDefault = (
    calculationType: CalculationType = CalculateAs.CHANGE,
): ICalculationDefaultValue => {
    return CALCULATION_VALUES_DEFAULT[calculationType];
};

const getComparisonDefaultColor = (
    colorType: ComparisonColorType,
    colorPalette: IColorPalette,
): IRgbColorValue => {
    return getColorByGuid(colorPalette, colorType, DEFAULT_COMPARISON_COLORS_INDEX[colorType]);
};

const getComparisonPaletteColorByType = (
    value: string,
    colorType: ComparisonColorType,
    colorPalette: IColorPalette,
): IRgbColorValue => {
    return getColorByGuid(colorPalette, value, DEFAULT_COMPARISON_COLORS_INDEX[colorType]);
};

/**
 * @internal
 */
const getComparisonRgbColor = (
    color: IColor | null | undefined,
    colorType: ComparisonColorType,
    colorPalette: IColorPalette = DEFAULT_COMPARISON_PALETTE,
): IRgbColorValue => {
    if (!isValidMappedColor(color, colorPalette)) {
        return getComparisonDefaultColor(colorType, colorPalette);
    }

    if (isColorFromPalette(color)) {
        return getComparisonPaletteColorByType(color.value, colorType, colorPalette);
    }

    return color!.value;
};

/**
 * NOTE: exported to satisfy sdk-ui-ext; is internal, must not be used outside of SDK; will disapppear.
 */
export type { ICalculationDefaultValue, IDefaultLabelKeys };
export {
    CALCULATION_VALUES_DEFAULT,
    DEFAULT_COMPARISON_PALETTE,
    getCalculationValuesDefault,
    getComparisonFormat,
    getComparisonRgbColor,
    ComparisonColorType,
};
