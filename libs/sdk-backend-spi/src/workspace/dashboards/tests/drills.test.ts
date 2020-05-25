// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import { isDrillToLegacyDashboard, isDrillToDashboard, isDrillToInsight } from "../drills";
import { drillToLegacyDashboard, drillToDashboard, drillToInsight } from "./drills.fixtures";

describe("dashboard drills type guards", () => {
    describe("isDrillToLegacyDashboard", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "drill to insight", drillToInsight],
            [false, "drill to dashboard", drillToDashboard],
            [true, "drill to legacy dashboard", drillToLegacyDashboard],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDrillToLegacyDashboard(input)).toBe(expectedResult);
        });
    });

    describe("isDrillToDashboard", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "drill to insight", drillToInsight],
            [true, "drill to dashboard", drillToDashboard],
            [false, "drill to legacy dashboard", drillToLegacyDashboard],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDrillToDashboard(input)).toBe(expectedResult);
        });
    });

    describe("isDrillToInsight", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "drill to insight", drillToInsight],
            [false, "drill to dashboard", drillToDashboard],
            [false, "drill to legacy dashboard", drillToLegacyDashboard],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDrillToInsight(input)).toBe(expectedResult);
        });
    });
});
