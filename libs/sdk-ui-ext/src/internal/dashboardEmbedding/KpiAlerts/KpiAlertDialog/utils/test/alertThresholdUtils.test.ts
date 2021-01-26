// (C) 2020-2021 GoodData Corporation
import { thresholdFromDecimalToPercent, thresholdFromPercentToDecimal } from "../alertThresholdUtils";

describe("alertThresholdUtils functions", () => {
    describe("thresholdFromDecimalToPercent", () => {
        it.each([
            [null, 0],
            [0.4, 40],
            [0.40005, 40.005],
            [123.45678, 12345.678],
        ])("should convert decimal number (%d) to percent (%d)", (input: number | null, expected: number) => {
            expect(thresholdFromDecimalToPercent(input)).toEqual(expected);
        });
    });

    describe("thresholdFromPercentToDecimal", () => {
        it.each([
            [null, 0],
            [40, 0.4],
            [40.005, 0.40005],
            [12345.678, 123.45678],
        ])("should convert percent (%d) to decimal number (%d)", (input: number | null, expected: number) => {
            expect(thresholdFromPercentToDecimal(input)).toEqual(expected);
        });
    });
});
