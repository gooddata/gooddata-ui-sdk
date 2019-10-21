// (C) 2019 GoodData Corporation

import { Account, Activity } from "../../../__mocks__/model";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import {
    newAbsoluteDateFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../factory";
import {
    DateGranularity,
    isAbsoluteDateFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
} from "../index";

describe("filter type guards", () => {
    describe("isPositiveAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "positive filter", newPositiveAttributeFilter(Account.Name, ["value"])],
            [false, "negative filter", newNegativeAttributeFilter(Activity.Subject, ["otherValue"])],
            [false, "relative date filter", newRelativeDateFilter("dd1", DateGranularity.month, 0, -1)],
            [false, "absolute date filter", newAbsoluteDateFilter("dd1", "01/01/2019", "10/10/2019")],
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
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilter(input)).toBe(expectedResult);
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
});
