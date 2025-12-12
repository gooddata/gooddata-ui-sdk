// (C) 2023-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { type IColorFromPalette, type IRgbColor } from "@gooddata/sdk-model";

import { CalculateAs, type CalculationType } from "../../../interfaces/index.js";
import {
    ComparisonColorType,
    DEFAULT_COMPARISON_PALETTE,
    type ICalculationDefaultValue,
    getCalculationValuesDefault,
    getComparisonFormat,
    getComparisonRgbColor,
} from "../headlineHelper.js";

describe("headlineHelper", () => {
    const PERCENT_ROUNDED_FORMAT = "#,##0%";
    const DECIMAL_FORMAT = "#,##0.0";

    describe("getCalculationValuesDefault", () => {
        const specs: Array<[CalculationType, ICalculationDefaultValue]> = [
            [
                undefined,
                {
                    defaultLabelKeys: {
                        nonConditionalKey: "visualizations.headline.comparison.title.change",
                        positiveKey: "visualizations.headline.comparison.title.change.positive",
                        negativeKey: "visualizations.headline.comparison.title.change.negative",
                        equalsKey: "visualizations.headline.comparison.title.change.equals",
                    },
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculateAs.RATIO,
                {
                    defaultLabelKeys: {
                        nonConditionalKey: "visualizations.headline.comparison.title.ratio",
                    },
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculateAs.CHANGE,
                {
                    defaultLabelKeys: {
                        nonConditionalKey: "visualizations.headline.comparison.title.change",
                        positiveKey: "visualizations.headline.comparison.title.change.positive",
                        negativeKey: "visualizations.headline.comparison.title.change.negative",
                        equalsKey: "visualizations.headline.comparison.title.change.equals",
                    },
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculateAs.CHANGE_DIFFERENCE,
                {
                    defaultLabelKeys: {
                        nonConditionalKey: "visualizations.headline.comparison.title.change",
                        positiveKey: "visualizations.headline.comparison.title.change.positive",
                        negativeKey: "visualizations.headline.comparison.title.change.negative",
                        equalsKey: "visualizations.headline.comparison.title.change.equals",
                    },
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                    defaultSubFormat: null,
                },
            ],
            [
                CalculateAs.DIFFERENCE,
                {
                    defaultLabelKeys: {
                        nonConditionalKey: "visualizations.headline.comparison.title.difference",
                        positiveKey: "visualizations.headline.comparison.title.difference.positive",
                        negativeKey: "visualizations.headline.comparison.title.difference.negative",
                        equalsKey: "visualizations.headline.comparison.title.difference.equals",
                    },
                    defaultFormat: null,
                },
            ],
        ];

        it.each(specs)(
            "Should get correctly default values when calculation type is %s",
            (calculationType: CalculationType, expected: ICalculationDefaultValue) => {
                expect(getCalculationValuesDefault(calculationType)).toEqual(expected);
            },
        );
    });

    describe("getComparisonFormat", () => {
        it("Should return default format when provided format is undefined", () => {
            expect(getComparisonFormat(undefined, PERCENT_ROUNDED_FORMAT)).toEqual(PERCENT_ROUNDED_FORMAT);
        });

        it("Should return provided format itself when is is null", () => {
            expect(getComparisonFormat(null, PERCENT_ROUNDED_FORMAT)).toEqual(null);
        });

        it("Should return provided format when it is not empty", () => {
            expect(getComparisonFormat(DECIMAL_FORMAT, PERCENT_ROUNDED_FORMAT)).toEqual(DECIMAL_FORMAT);
            expect(getComparisonFormat(PERCENT_ROUNDED_FORMAT, DECIMAL_FORMAT)).toEqual(
                PERCENT_ROUNDED_FORMAT,
            );
        });
    });

    describe("getComparisonRgbColor", () => {
        const colorPalette = DEFAULT_COMPARISON_PALETTE;

        it("Should return rgb color from palette in case color is empty", () => {
            expect(getComparisonRgbColor(null, ComparisonColorType.POSITIVE, colorPalette)).toEqual(
                colorPalette[0].fill,
            );
            expect(getComparisonRgbColor(null, ComparisonColorType.NEGATIVE, colorPalette)).toEqual(
                colorPalette[1].fill,
            );
            expect(getComparisonRgbColor(null, ComparisonColorType.EQUALS, colorPalette)).toEqual(
                colorPalette[2].fill,
            );
        });

        it("Should return correctly from provided rgb color", () => {
            const color: IRgbColor = {
                type: "rgb",
                value: { r: 1, g: 1, b: 1 },
            };

            expect(getComparisonRgbColor(color, ComparisonColorType.POSITIVE, colorPalette)).toEqual(
                color.value,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.NEGATIVE, colorPalette)).toEqual(
                color.value,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.EQUALS, colorPalette)).toEqual(
                color.value,
            );
        });

        it("Should return correctly from provided color from palette", () => {
            const color: IColorFromPalette = {
                type: "guid",
                value: "positive",
            };

            expect(getComparisonRgbColor(color, ComparisonColorType.POSITIVE, colorPalette)).toEqual(
                colorPalette[0].fill,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.NEGATIVE, colorPalette)).toEqual(
                colorPalette[0].fill,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.EQUALS, colorPalette)).toEqual(
                colorPalette[0].fill,
            );
        });

        it("Should return correctly color from color type when provided color is not match", () => {
            const color: IColorFromPalette = {
                type: "guid",
                value: "not-match-color",
            };

            expect(getComparisonRgbColor(color, ComparisonColorType.POSITIVE, colorPalette)).toEqual(
                colorPalette[0].fill,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.NEGATIVE, colorPalette)).toEqual(
                colorPalette[1].fill,
            );
            expect(getComparisonRgbColor(color, ComparisonColorType.EQUALS, colorPalette)).toEqual(
                colorPalette[2].fill,
            );
        });
    });
});
