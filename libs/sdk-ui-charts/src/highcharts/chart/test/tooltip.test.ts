// (C) 2007-2019 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { formatValueForTooltip, getFormattedValueForTooltip } from "../tooltip";

const testFormat: string = "#,##0.00";
const testPointData = {
    y: 1,
    format: "# ###",
    name: "point",
    category: {
        name: "category",
        parent: {
            name: "parent category",
        },
    },
    series: {
        name: "series",
    },
};
const testSeparators: ISeparators = { decimal: "_", thousand: "=" };

describe("tooltip", () => {
    describe("formatValueForTooltip()", () => {
        it("should return formatted value with no separators", () => {
            const formattedValue = formatValueForTooltip(36525, testFormat);
            expect(formattedValue).toEqual("36,525.00");
        });

        it("should return formatted value with separators", () => {
            const formattedValue = formatValueForTooltip(858, testFormat, testSeparators);
            expect(formattedValue).toEqual("858_00");
        });
    });

    describe("getFormattedValueForTooltip()", () => {
        it.each([
            [false, false, 45.24], // stackMeasuresToPercent
            [false, true, null], // percentageValue
            [true, true, 45.24], // isDualAxis + isSecondAxis
        ])(
            "should return number if isDualChartWithRightAxis is %s, stackMeasuresToPercent is %s, percentageValue is %s",
            (isDualChartWithRightAxis: boolean, stackMeasuresToPercent: boolean, percentageValue: number) => {
                const formattedValue = getFormattedValueForTooltip(
                    isDualChartWithRightAxis,
                    stackMeasuresToPercent,
                    testPointData,
                    testSeparators,
                    percentageValue,
                );
                expect(formattedValue).toEqual(" 1");
            },
        );
        it.each([
            ["0%", false, true, 0],
            ["45.25%", false, true, 45.2490089197225],
            ["100%", false, true, 100],
        ])(
            "should return %s if isDualChartWithRightAxis is %s, stackMeasuresToPercent is %s, percentageValue is %s",
            (
                expectedValue: string,
                isDualChartWithRightAxis: boolean,
                stackMeasuresToPercent: boolean,
                percentageValue: number,
            ) => {
                const formattedValue = getFormattedValueForTooltip(
                    isDualChartWithRightAxis,
                    stackMeasuresToPercent,
                    testPointData,
                    testSeparators,
                    percentageValue,
                );
                expect(formattedValue).toEqual(expectedValue);
            },
        );
    });
});
