// (C) 2023-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { IColor } from "@gooddata/sdk-model";
import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

import { IComparisonControlProperties } from "../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { createTestProperties } from "../../tests/testDataProvider.js";
import { createIntlMock } from "../../tests/testIntlProvider.js";
import {
    getComparisonDefaultValues,
    getPresets,
    getTemplates,
    isComparisonDefaultColors,
} from "../comparisonHelper.js";

describe("comparisonHelper", () => {
    describe("getComparisonDefaultValues", () => {
        const PERCENT_ROUNDED_FORMAT = "#,##0%";
        const CHANGE_LABEL_KEYS = {
            nonConditionalKey: "visualizations.headline.comparison.title.change",
            positiveKey: "visualizations.headline.comparison.title.change.positive",
            negativeKey: "visualizations.headline.comparison.title.change.negative",
            equalsKey: "visualizations.headline.comparison.title.change.equals",
        };
        const RATIO_LABEL_KEYS = {
            nonConditionalKey: "visualizations.headline.comparison.title.ratio",
        };
        const DIFFERENCE_LABEL_KEYS = {
            nonConditionalKey: "visualizations.headline.comparison.title.difference",
            positiveKey: "visualizations.headline.comparison.title.difference.positive",
            negativeKey: "visualizations.headline.comparison.title.difference.negative",
            equalsKey: "visualizations.headline.comparison.title.difference.equals",
        };
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
                { format: null, labels: DIFFERENCE_LABEL_KEYS },
            ],
            [
                "Should use default calculation type [CHANGE]",
                { calculationType: CalculateAs.CHANGE, props: {} },
                { format: PERCENT_ROUNDED_FORMAT, labels: CHANGE_LABEL_KEYS },
            ],
            [
                "Should use default calculation type [RATIO]",
                { calculationType: CalculateAs.RATIO, props: {} },
                { format: PERCENT_ROUNDED_FORMAT, labels: RATIO_LABEL_KEYS },
            ],
            [
                "Should use provided calculation type [DIFFERENCE]",
                { calculationType: null, props: differenceProperties },
                { format: null, labels: DIFFERENCE_LABEL_KEYS },
            ],
            [
                "Should use provided calculation type [CHANGE]",
                { calculationType: null, props: changeProperties },
                { format: PERCENT_ROUNDED_FORMAT, labels: CHANGE_LABEL_KEYS },
            ],
            [
                "Should use provided calculation type [RATIO]",
                { calculationType: null, props: ratioProperties },
                { format: PERCENT_ROUNDED_FORMAT, labels: RATIO_LABEL_KEYS },
            ],
        ];

        it.each(SPECS)("%s", ((...args: any[]) => {
            const [_condition, data, expected] = args;
            const typedData = data as {
                calculationType: CalculationType;
                props: IVisualizationProperties<IComparisonControlProperties>;
            };
            const { defaultFormat, defaultLabelKeys } = getComparisonDefaultValues(
                typedData.calculationType,
                typedData.props,
            );

            expect(defaultFormat).toEqual(expected.format);
            expect(defaultLabelKeys).toEqual(expected.labels);
        }) as any);
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
