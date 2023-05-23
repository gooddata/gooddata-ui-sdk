// (C) 2019-2022 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isKpiWithComparison, isKpiWithoutComparison } from "../kpi.js";
import { kpiWithComparison, kpiWithoutComparison } from "./kpi.fixtures";

describe("kpi type guards", () => {
    describe("isKpiWithComparison", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "kpi with comparison", kpiWithComparison],
            [false, "kpi without comparison", kpiWithoutComparison],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isKpiWithComparison(input)).toBe(expectedResult);
        });
    });

    describe("isKpiWithoutComparison", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "kpi with comparison", kpiWithComparison],
            [true, "kpi without comparison", kpiWithoutComparison],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isKpiWithoutComparison(input)).toBe(expectedResult);
        });
    });
});
