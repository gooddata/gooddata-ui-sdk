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
        it.each([[false, 45.2490089197225], [true, null]])(
            "should return formatted number if stackMeasuresToPercent is %s and percentageValue is %s",
            (stackMeasuresToPercent: boolean, percentageValue: number) => {
                const formattedValue = getFormattedValueForTooltip(
                    stackMeasuresToPercent,
                    testPointData,
                    testSeparators,
                    percentageValue,
                );
                expect(formattedValue).toEqual(" 1");
            },
        );
        it.each([["0%", 0], ["45.25%", 45.2490089197225], ["100%", 100]])(
            "should return %s if stackMeasuresToPercent is true and percentageValue is %s",
            (formattedValue: string, percentageValue: number) => {
                const tooltip = getFormattedValueForTooltip(
                    true,
                    testPointData,
                    testSeparators,
                    percentageValue,
                );
                expect(tooltip).toEqual(formattedValue);
            },
        );
    });
});
