// (C) 2019-2021 GoodData Corporation
import { describe, expect, it } from "vitest";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import {
    isDrillToLegacyDashboard,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillFromMeasure,
    isDrillFromAttribute,
} from "../drill.js";
import {
    drillToLegacyDashboard,
    drillToDashboard,
    drillToInsight,
    drillFromMeasure,
    drillFromAttribute,
} from "./drills.fixtures.js";

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

    describe("isDrillFromMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "drill from measure", drillFromMeasure],
            [false, "drill from attribute", drillFromAttribute],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDrillFromMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isDrillFromAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "drill from measure", drillFromMeasure],
            [true, "drill from attribute", drillFromAttribute],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDrillFromAttribute(input)).toBe(expectedResult);
        });
    });
});
