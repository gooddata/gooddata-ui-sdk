// (C) 2023 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { getRgbStringFromRGB } from "@gooddata/sdk-ui-vis-commons";

import { IColorConfig } from "../../../../interfaces/index.js";
import { EvaluationType } from "../interfaces/BaseHeadlines.js";
import {
    ComparisonColorType,
    DEFAULT_COMPARISON_PALETTE,
    getComparisonRgbColor,
} from "../../headlineHelper.js";

export const getComparisonColor = (
    colorConfig: IColorConfig,
    evaluationType: EvaluationType,
    colorPalette: IColorPalette = DEFAULT_COMPARISON_PALETTE,
) => {
    if (colorConfig?.disabled || !evaluationType) {
        return null;
    }

    const { providedColor, colorType } = getProvidedColorByEvaluationType(colorConfig, evaluationType);
    const rgbColor = getComparisonRgbColor(providedColor, colorType, colorPalette);

    return rgbColor && getRgbStringFromRGB(rgbColor);
};

const getProvidedColorByEvaluationType = (colorConfig: IColorConfig, evaluationType: EvaluationType) => {
    switch (evaluationType) {
        case EvaluationType.POSITIVE_VALUE:
            return {
                providedColor: colorConfig?.positive,
                colorType: ComparisonColorType.POSITIVE,
            };

        case EvaluationType.NEGATIVE_VALUE:
            return {
                providedColor: colorConfig?.negative,
                colorType: ComparisonColorType.NEGATIVE,
            };

        default:
        case EvaluationType.EQUALS_VALUE:
            return {
                providedColor: colorConfig?.equals,
                colorType: ComparisonColorType.EQUALS,
            };
    }
};
