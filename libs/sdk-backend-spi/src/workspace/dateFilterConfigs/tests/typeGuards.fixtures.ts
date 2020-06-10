// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import {
    isAllTimeDateFilter,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterOption,
    isAbsoluteDateFilterPreset,
    isRelativeDateFilterForm,
    isRelativeDateFilterOption,
    isRelativeDateFilterPreset,
} from "../types";
import {
    allTimeDateFilter,
    absoluteDateFilterForm,
    absoluteDateFilterOption,
    absoluteDateFilterPreset,
    relativeDateFilterForm,
    relativeDateFilterOption,
    relativeDateFilterPreset,
} from "./typeGuards";

describe("dashboard extended date filters type guards", () => {
    describe("isAllTimeDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAllTimeDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterForm", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [true, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilterForm(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterPreset", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [true, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilterPreset(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterOption", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [true, "absolute date filter form", absoluteDateFilterForm],
            [true, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilterOption(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilterForm", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [true, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRelativeDateFilterForm(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilterPreset", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [true, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRelativeDateFilterPreset(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilterOption", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "absolute date filter option", absoluteDateFilterOption],
            [true, "relative date filter form", relativeDateFilterForm],
            [true, "relative date filter preset", relativeDateFilterPreset],
            [true, "relative date filter option", relativeDateFilterOption],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRelativeDateFilterOption(input)).toBe(expectedResult);
        });
    });
});
