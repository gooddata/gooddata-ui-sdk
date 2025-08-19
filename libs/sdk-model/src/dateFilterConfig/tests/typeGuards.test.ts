// (C) 2019-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import {
    absoluteDateFilterForm,
    absoluteDateFilterPreset,
    allTimeDateFilter,
    relativeDateFilterForm,
    relativeDateFilterPreset,
} from "./typeGuards.fixtures.js";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import {
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "../index.js";

describe("dashboard extended date filters type guards", () => {
    describe("isAllTimeDateFilterOption", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "all time date filter", allTimeDateFilter],
            [false, "absolute date filter form", absoluteDateFilterForm],
            [false, "absolute date filter preset", absoluteDateFilterPreset],
            [false, "relative date filter form", relativeDateFilterForm],
            [false, "relative date filter preset", relativeDateFilterPreset],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAllTimeDateFilterOption(input)).toBe(expectedResult);
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
});
