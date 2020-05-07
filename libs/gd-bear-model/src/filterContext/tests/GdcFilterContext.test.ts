// (C) 2019 GoodData Corporation
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { GdcFilterContext } from "../GdcFilterContext";
import { attributeFilter, dateFilter } from "./GdcFilterContext.fixtures";

describe("GdcFilterContext", () => {
    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute filter", attributeFilter],
            [false, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcFilterContext.isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute filter", attributeFilter],
            [true, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(GdcFilterContext.isDateFilter(input)).toBe(expectedResult);
        });
    });
});
