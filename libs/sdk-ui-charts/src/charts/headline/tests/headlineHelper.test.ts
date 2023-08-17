// (C) 2023 GoodData Corporation
import { describe, expect, it } from "vitest";
import { CalculationType } from "../../../interfaces/index.js";
import { getCalculationValuesDefault, ICalculationDefaultValue } from "../headlineHelper.js";

describe("headlineHelper", () => {
    describe("getCalculationValuesDefault", () => {
        const specs = [
            [
                undefined,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.change",
                    defaultFormat: "#,##0%",
                },
            ],
            [
                CalculationType.RATIO,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.ratio",
                    defaultFormat: "#,##0%",
                },
            ],
            [
                CalculationType.CHANGE,
                {
                    defaultLabelKey: "visualizations.headline.comparison.title.change",
                    defaultFormat: "#,##0%",
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
});
