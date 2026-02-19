// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { Account, Activity, Won } from "../../../../__mocks__/model.js";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards.js";
import { DateGranularity } from "../../../base/dateGranularities.js";
import {
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
} from "../factory.js";
import {
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isAllTimeDateFilterWithEmptyValueHandling,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isComparisonCondition,
    isComparisonConditionOperator,
    isDateFilterWithEmptyValueHandling,
    isFilter,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRangeConditionOperator,
    isRankingFilter,
    isRelativeDateFilter,
} from "../index.js";

describe("filter type guards", () => {
    describe("isFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [true, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [true, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [true, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [true, "measure value filter", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
            [true, "ranking filter", newRankingFilter(Won, "TOP", 10)],
            [false, "attribute", Account.Name],
            [false, "measure", Won],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isFilter(input)).toBe(expectedResult);
        });
    });

    describe("isPositiveAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPositiveAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isNegativeAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [true, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNegativeAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [true, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRelativeDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [true, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAllTimeDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "all time date filter", newAllTimeFilter("dd1")],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAllTimeDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAllTimeDateFilterWithEmptyValueHandling", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter without emptyValueHandling", newAllTimeFilter("dd1")],
            [
                true,
                "all time date filter with emptyValueHandling",
                newAllTimeFilter("dd1", undefined, "exclude"),
            ],
            [
                false,
                "relative date filter with emptyValueHandling",
                newRelativeDateFilter(
                    "dd1",
                    DateGranularity["month"],
                    0,
                    -1,
                    undefined,
                    undefined,
                    "exclude",
                ),
            ],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAllTimeDateFilterWithEmptyValueHandling(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilterWithEmptyValueHandling", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter without emptyValueHandling", newAllTimeFilter("dd1")],
            [
                true,
                "all time date filter with emptyValueHandling",
                newAllTimeFilter("dd1", undefined, "include"),
            ],
            [
                true,
                "relative date filter with emptyValueHandling",
                newRelativeDateFilter(
                    "dd1",
                    DateGranularity["month"],
                    0,
                    -1,
                    undefined,
                    undefined,
                    "exclude",
                ),
            ],
            [
                true,
                "absolute date filter with emptyValueHandling",
                newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019", undefined, "exclude"),
            ],
            [
                false,
                "relative date filter without emptyValueHandling",
                newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1),
            ],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDateFilterWithEmptyValueHandling(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "ranking filter", newRankingFilter(Won, "TOP", 3)],
            [true, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [true, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureValueFilter(input)).toBe(expectedResult);
        });
    });

    describe("isRankingFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity["month"], 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
            [true, "ranking filter", newRankingFilter(Won, "TOP", 3)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRankingFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeElementsByRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute by ref", { uris: ["/uri1", "/uri2"] }],
            [false, "attribute by value", { values: ["value1", "value2"] }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeElementsByRef(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeElementsByValue", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute by ref", { uris: ["/uri1", "/uri2"] }],
            [true, "attribute by value", { values: ["value1", "value2"] }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeElementsByValue(input)).toBe(expectedResult);
        });
    });

    describe("isComparisonCondition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "comparison condition", { comparison: { operator: "EQUAL_TO", value: 11 } }],
            [false, "range condition", { range: { operator: "BETWEEN", from: 0, to: 100 } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isComparisonCondition(input)).toBe(expectedResult);
        });
    });

    describe("isComparisonConditionOperator", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "comparison condition", "EQUAL_TO"],
            [false, "range condition", "BETWEEN"],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isComparisonConditionOperator(input)).toBe(expectedResult);
        });
    });

    describe("isRangeCondition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "comparison condition", { comparison: { operator: "EQUAL_TO", value: 11 } }],
            [true, "range condition", { range: { operator: "BETWEEN", from: 0, to: 100 } }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRangeCondition(input)).toBe(expectedResult);
        });
    });

    describe("isRangeConditionOperator", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "comparison condition", "EQUAL_TO"],
            [true, "range condition", "BETWEEN"],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRangeConditionOperator(input)).toBe(expectedResult);
        });
    });
});
