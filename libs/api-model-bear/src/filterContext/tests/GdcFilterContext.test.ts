// (C) 2019 GoodData Corporation
import { describe, it, expect } from "vitest";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isFilterContextAttributeFilter, isFilterContextDateFilter } from "../GdcFilterContext.js";
import { attributeFilter, dateFilter } from "./GdcFilterContext.fixtures.js";

describe("GdcFilterContext", () => {
    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute filter", attributeFilter],
            [false, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContextAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute filter", attributeFilter],
            [true, "date filter", dateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContextDateFilter(input)).toBe(expectedResult);
        });
    });
});
