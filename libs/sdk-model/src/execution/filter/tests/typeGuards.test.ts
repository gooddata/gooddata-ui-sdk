// (C) 2019-2020 GoodData Corporation

import { Account, Activity, Won } from "../../../../__mocks__/model";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import {
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../factory";
import {
    isAbsoluteDateFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isComparisonCondition,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRangeCondition,
    isRelativeDateFilter,
    isComparisonConditionOperator,
    isRangeConditionOperator,
} from "../index";
import { DateGranularity } from "../../../base/dateGranularities";

describe("filter type guards", () => {
    describe("isPositiveAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
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
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
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
            [true, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
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
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
            [true, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [false, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [false, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("newMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
            [true, "measure value filter - comparison", newMeasureValueFilter(Won, "EQUAL_TO", 11)],
            [true, "measure value filter - range", newMeasureValueFilter(Won, "BETWEEN", 0, 100)],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureValueFilter(input)).toBe(expectedResult);
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
