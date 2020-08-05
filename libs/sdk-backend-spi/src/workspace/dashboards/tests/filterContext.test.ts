// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import {
    filterContext,
    filterContextDefinition,
    tempFilterContext,
    dashboardAttributeFilter,
    dashboardAttributeFilterReference,
    dashboardDateFilter,
    dashboardDateFilterReference,
} from "./filterContext.fixtures";
import {
    isDashboardAttributeFilter,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
} from "../filterContext";

describe("filter context type guards", () => {
    describe("isDashboardAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard attribute filter", dashboardAttributeFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard date filter", dashboardDateFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardAttributeFilterReference", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard attribute filter reference", dashboardAttributeFilterReference],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardAttributeFilterReference(input)).toBe(expectedResult);
        });
    });

    describe("isDashboardDateFilterReference", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dashboard date filter reference", dashboardDateFilterReference],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDashboardDateFilterReference(input)).toBe(expectedResult);
        });
    });

    describe("isFilterContext", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "filter context", filterContext],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContext(input)).toBe(expectedResult);
        });
    });

    describe("isFilterContextDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "filter context definition", filterContextDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilterContextDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isTempFilterContext", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "temp filter context", tempFilterContext],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isTempFilterContext(input)).toBe(expectedResult);
        });
    });
});
