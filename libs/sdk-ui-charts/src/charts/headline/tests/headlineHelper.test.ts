// (C) 2023 GoodData Corporation
import { describe, expect, it } from "vitest";
import { CalculationType } from "../../../interfaces/index.js";
import {
    getCalculationValuesDefault,
    getComparisonFormat,
    ICalculationDefaultValue,
} from "../headlineHelper.js";

describe("headlineHelper", () => {
    const PERCENT_ROUNDED_FORMAT = "#,##0%";
    const DECIMAL_FORMAT = "#,##0.0";

    describe("getCalculationValuesDefault", () => {
        const specs = [
            [
                undefined,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.change",
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculationType.RATIO,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.ratio",
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculationType.CHANGE,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.change",
                    defaultFormat: PERCENT_ROUNDED_FORMAT,
                },
            ],
            [
                CalculationType.DIFFERENCE,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.difference",
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
});
