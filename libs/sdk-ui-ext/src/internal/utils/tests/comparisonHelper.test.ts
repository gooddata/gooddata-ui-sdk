// (C) 2023 GoodData Corporation

import { describe, expect, it } from "vitest";
import { CalculationType } from "@gooddata/sdk-ui-charts";
import {
    getComparisonDefaultFormat,
    getPresets,
    getTemplates,
    isComparisonDefaultColors,
} from "../comparisonHelper.js";
import { createTestProperties } from "../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../interfaces/ControlProperties.js";
import { createIntlMock } from "../../tests/testIntlProvider.js";
import { IColor } from "@gooddata/sdk-model";

describe("comparisonHelper", () => {
    describe("getComparisonDefaultFormat", () => {
        const PERCENT_ROUNDED_FORMAT = "#,##0%";

        it("Should use default calculation type to get default format in case calculation is empty", () => {
            expect(getComparisonDefaultFormat(CalculationType.DIFFERENCE, {})).toEqual(null);
            expect(getComparisonDefaultFormat(CalculationType.CHANGE, {})).toEqual(PERCENT_ROUNDED_FORMAT);
            expect(getComparisonDefaultFormat(CalculationType.RATIO, {})).toEqual(PERCENT_ROUNDED_FORMAT);
        });

        it("Should use provided calculation type to get default format", () => {
            const properties = createTestProperties<IComparisonControlProperties>({
                comparison: {
                    enabled: true,
                },
            });

            properties.controls.comparison.calculationType = CalculationType.CHANGE;
            expect(getComparisonDefaultFormat(CalculationType.DIFFERENCE, properties)).toEqual(
                PERCENT_ROUNDED_FORMAT,
            );

            properties.controls.comparison.calculationType = CalculationType.RATIO;
            expect(getComparisonDefaultFormat(CalculationType.DIFFERENCE, properties)).toEqual(
                PERCENT_ROUNDED_FORMAT,
            );

            properties.controls.comparison.calculationType = CalculationType.DIFFERENCE;
            expect(getComparisonDefaultFormat(CalculationType.RATIO, properties)).toEqual(null);
        });
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
