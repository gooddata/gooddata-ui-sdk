// (C) 2023 GoodData Corporation

import { describe, expect, it } from "vitest";
import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";
import {
    getComparisonDefaultValues,
    getPresets,
    getTemplates,
    isComparisonDefaultColors,
} from "../comparisonHelper.js";
import { IComparisonControlProperties } from "../../interfaces/ControlProperties.js";
import { createIntlMock } from "../../tests/testIntlProvider.js";
import { IColor } from "@gooddata/sdk-model";
import { createTestProperties } from "../../tests/testDataProvider.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";

describe("comparisonHelper", () => {
    describe("getComparisonDefaultValues", () => {
        const PERCENT_ROUNDED_FORMAT = "#,##0%";
        const CHANGE_LABEL_KEY = "visualizations.headline.comparison.title.change";
        const RATIO_LABEL_KEY = "visualizations.headline.comparison.title.ratio";
        const DIFFERENCE_LABEL_KEY = "visualizations.headline.comparison.title.difference";
        const differenceProperties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.DIFFERENCE,
            },
        });
        const changeProperties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.CHANGE,
            },
        });
        const ratioProperties = createTestProperties<IComparisonControlProperties>({
            comparison: {
                enabled: true,
                calculationType: CalculateAs.RATIO,
            },
        });
        const SPECS: any = [
            [
                "Should use default calculation type [DIFFERENCE]",
                { calculationType: CalculateAs.DIFFERENCE, props: {} },
                { format: null, label: DIFFERENCE_LABEL_KEY },
            ],
            [
                "Should use default calculation type [CHANGE]",
                { calculationType: CalculateAs.CHANGE, props: {} },
                { format: PERCENT_ROUNDED_FORMAT, label: CHANGE_LABEL_KEY },
            ],
            [
                "Should use default calculation type [RATIO]",
                { calculationType: CalculateAs.RATIO, props: {} },
                { format: PERCENT_ROUNDED_FORMAT, label: RATIO_LABEL_KEY },
            ],
            [
                "Should use provided calculation type [DIFFERENCE]",
                { calculationType: null, props: differenceProperties },
                { format: null, label: DIFFERENCE_LABEL_KEY },
            ],
            [
                "Should use provided calculation type [CHANGE]",
                { calculationType: null, props: changeProperties },
                { format: PERCENT_ROUNDED_FORMAT, label: CHANGE_LABEL_KEY },
            ],
            [
                "Should use provided calculation type [RATIO]",
                { calculationType: null, props: ratioProperties },
                { format: PERCENT_ROUNDED_FORMAT, label: RATIO_LABEL_KEY },
            ],
        ];

        it.each(SPECS)(
            "%s",
            (
                _condition: string,
                data: {
                    calculationType: CalculationType;
                    props: IVisualizationProperties<IComparisonControlProperties>;
                },
                expected: { format: string; label: string },
            ) => {
                const { defaultFormat, defaultLabelKey } = getComparisonDefaultValues(
                    data.calculationType,
                    data.props,
                );

                expect(defaultFormat).toEqual(expected.format);
                expect(defaultLabelKey).toEqual(expected.label);
            },
        );
    });

    describe("getPresets", () => {
        it("Should get presets correctly", () => {
            expect(getPresets(createIntlMock())).toMatchSnapshot();
        });
    });

    describe("getTemplates", () => {
        it("Should get presets correctly", () => {
            expect(getTemplates(createIntlMock())).toMatchSnapshot();
        });
    });

    describe("isComparisonDefaultColors", () => {
        it("Should return false when color config is not empty", () => {
            const color: IColor = {
                type: "guid",
                value: "positive",
            };

            expect(isComparisonDefaultColors({ equals: color })).toBeFalsy();
            expect(isComparisonDefaultColors({ positive: color })).toBeFalsy();
            expect(isComparisonDefaultColors({ negative: color })).toBeFalsy();
            expect(
                isComparisonDefaultColors({ positive: color, negative: color, equals: color }),
            ).toBeFalsy();
        });

        it("Should return true when color config is empty", () => {
            expect(isComparisonDefaultColors({})).toBeTruthy();
            expect(isComparisonDefaultColors(null)).toBeTruthy();
            expect(isComparisonDefaultColors(undefined)).toBeTruthy();
        });
    });
});
