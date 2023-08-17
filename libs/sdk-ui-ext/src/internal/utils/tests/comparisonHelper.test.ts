// (C) 2023 GoodData Corporation

import { describe, expect, it } from "vitest";
import { CalculationType } from "@gooddata/sdk-ui-charts";
import { getComparisonDefaultFormat, getPresets, getTemplates } from "../comparisonHelper.js";
import { createTestProperties } from "../../tests/testDataProvider.js";
import { IComparisonControlProperties } from "../../interfaces/ControlProperties.js";
import { createIntlMock } from "../../tests/testIntlProvider.js";

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
});
