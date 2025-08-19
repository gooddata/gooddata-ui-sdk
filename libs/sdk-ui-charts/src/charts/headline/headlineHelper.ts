// (C) 2023-2025 GoodData Corporation
import { defineMessage } from "react-intl";

import { IColor, IColorPalette, IRgbColorValue, isColorFromPalette } from "@gooddata/sdk-model";
import { getColorByGuid, isValidMappedColor } from "@gooddata/sdk-ui-vis-commons";

import { CalculateAs, CalculationType } from "../../interfaces/index.js";

/**
 * @internal
 */
interface ICalculationDefaultValue {
    defaultLabelKeys: IDefaultLabelKeys;
    defaultFormat: string;
    defaultSubFormat?: string;
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
const CALCULATION_VALUES_DEFAULT: { [key in CalculationType]?: ICalculationDefaultValue } = {
    [CalculateAs.CHANGE]: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.change" }).id,
            positiveKey: defineMessage({ id: "visualizations.headline.comparison.title.change.positive" }).id,
            negativeKey: defineMessage({ id: "visualizations.headline.comparison.title.change.negative" }).id,
            equalsKey: defineMessage({ id: "visualizations.headline.comparison.title.change.equals" }).id,
        },
        defaultFormat: "#,##0%",
    },
    [CalculateAs.RATIO]: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.ratio" }).id,
        },
        defaultFormat: "#,##0%",
    },
    [CalculateAs.CHANGE_DIFFERENCE]: {
        defaultLabelKeys: {
            nonConditionalKey: defineMessage({ id: "visualizations.headline.comparison.title.change" }).id,
            positiveKey: defineMessage({ id: "visualizations.headline.comparison.title.change.positive" }).id,
            negativeKey: defineMessage({ id: "visualizations.headline.comparison.title.change.negative" }).id,
            equalsKey: defineMessage({ id: "visualizations.headline.comparison.title.change.equals" }).id,
        },
        defaultFormat: "#,##0%",
        defaultSubFormat: null,
    },
    [CalculateAs.DIFFERENCE]: {
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
const getComparisonFormat = (providedFormat: string, defaultFormat: string): string => {
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
    color: IColor,
    colorType: ComparisonColorType,
    colorPalette: IColorPalette = DEFAULT_COMPARISON_PALETTE,
): IRgbColorValue => {
    if (!isValidMappedColor(color, colorPalette)) {
        return getComparisonDefaultColor(colorType, colorPalette);
    }

    return isColorFromPalette(color)
        ? getComparisonPaletteColorByType(color.value, colorType, colorPalette)
        : color?.value;
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
