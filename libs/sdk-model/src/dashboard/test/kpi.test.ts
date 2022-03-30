// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { isLegacyKpiWithComparison, isLegacyKpiWithoutComparison } from "../kpi";
import { legacyKpiWithComparison, legacyKpiWithoutComparison } from "./kpi.fixtures";

describe("kpi type guards", () => {
    describe("isLegacyKpiWithComparison", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "legacy kpi with comparison", legacyKpiWithComparison],
            [false, "legacy kpi without comparison", legacyKpiWithoutComparison],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLegacyKpiWithComparison(input)).toBe(expectedResult);
        });
    });

    describe("isLegacyKpiWithoutComparison", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "legacy kpi with comparison", legacyKpiWithComparison],
            [true, "legacy kpi without comparison", legacyKpiWithoutComparison],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLegacyKpiWithoutComparison(input)).toBe(expectedResult);
        });
    });
});
