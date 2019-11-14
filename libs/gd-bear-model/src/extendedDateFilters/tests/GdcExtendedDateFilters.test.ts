// (C) 2019 GoodData Corporation
import { GdcExtendedDateFilters } from "../GdcExtendedDateFilters";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import {
    relativeForm,
    relativePreset,
    absoluteForm,
    absolutePreset,
    allTimeFilter,
} from "./GdcExtendedDateFilters.fixtures";

describe("GdcExtendedDateFilters", () => {
    describe("isAllTimeDateFilter", () => {
        it.each([
            ...InvalidInputTestCases,
            [false, "a relative form", relativeForm],
            [false, "a relative preset", relativePreset],
            [false, "an absolute form", absoluteForm],
            [false, "an absolute preset", absolutePreset],
            [true, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isAllTimeDateFilter(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterForm", () => {
        it.each([
            ...InvalidInputTestCases,
            [false, "a relative form", relativeForm],
            [false, "a relative preset", relativePreset],
            [true, "an absolute form", absoluteForm],
            [false, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterForm(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterPreset", () => {
        it.each([
            ...InvalidInputTestCases,
            [false, "a relative form", relativeForm],
            [false, "a relative preset", relativePreset],
            [false, "an absolute form", absoluteForm],
            [true, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterPreset(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isRelativeDateFilterForm", () => {
        it.each([
            ...InvalidInputTestCases,
            [true, "a relative form", relativeForm],
            [false, "a relative preset", relativePreset],
            [false, "an absolute form", absoluteForm],
            [false, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterForm(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isRelativeDateFilterPreset", () => {
        it.each([
            ...InvalidInputTestCases,
            [false, "a relative form", relativeForm],
            [true, "a relative preset", relativePreset],
            [false, "an absolute form", absoluteForm],
            [false, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterPreset(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isAbsoluteDateFilterOption", () => {
        it.each([
            ...InvalidInputTestCases,
            [false, "a relative form", relativeForm],
            [false, "a relative preset", relativePreset],
            [true, "an absolute form", absoluteForm],
            [true, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterOption(input);
            expect(result).toEqual(expectedResult);
        });
    });

    describe("isRelativeDateFilterOption", () => {
        it.each([
            ...InvalidInputTestCases,
            [true, "a relative form", relativeForm],
            [true, "a relative preset", relativePreset],
            [false, "an absolute form", absoluteForm],
            [false, "an absolute preset", absolutePreset],
            [false, "an all-time filter", allTimeFilter],
        ])("should return %s when %s is tested", (expectedResult, _desc, input) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterOption(input);
            expect(result).toEqual(expectedResult);
        });
    });
});
