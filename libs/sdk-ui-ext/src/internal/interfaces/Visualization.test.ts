// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    attributeFilter,
    dateFilter,
    measureValueFilter,
    rankingFilter,
} from "../tests/referencePointMocks.test.helpers.js";
import {
    isAttributeFilter,
    isDateFilter,
    isMeasureValueFilter,
    isRankingFilter,
} from "../utils/bucketHelper.js";

import { InvalidInputTestCases } from "./typeGuards.test.helpers.js";

describe("Visualization typeguards", () => {
    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "date filter", dateFilter],
            [false, "attribute filter", attributeFilter],
            [false, "ranking filter", rankingFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "date filter", dateFilter],
            [false, "ranking filter", rankingFilter],
            [true, "attribute filter", attributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "date filter", dateFilter],
            [false, "attribute filter", attributeFilter],
            [false, "ranking filter", rankingFilter],
            [true, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureValueFilter(input)).toBe(expectedResult);
        });
    });

    describe("isRankingFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "date filter", dateFilter],
            [false, "attribute filter", attributeFilter],
            [false, "measure value filter", measureValueFilter],
            [true, "ranking filter", rankingFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRankingFilter(input)).toBe(expectedResult);
        });
    });
});
