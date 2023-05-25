// (C) 2007-2018 GoodData Corporation
import { describe, it, expect } from "vitest";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import {
    isAbsoluteDateFilter,
    isArithmeticMeasureDefinition,
    isAttribute,
    isAttributeFilter,
    isDateFilter,
    isMeasure,
    isMeasureDefinition,
    isMeasureValueFilter,
    isNegativeAttributeFilter,
    isPopMeasureDefinition,
    isPositiveAttributeFilter,
    isPreviousPeriodMeasureDefinition,
    isRelativeDateFilter,
} from "../GdcVisualizationObject.js";
import {
    attribute,
    simpleMeasure,
    simpleMeasureDefinition,
    arithmeticMeasureDefinition,
    popMeasureDefinition,
    previousPeriodMeasureDefinition,
    relativeDateFilter,
    absoluteDateFilter,
    positiveAttributeFilter,
    negativeAttributeFilter,
    measureValueFilter,
} from "./GdcVisualizationObject.fixtures.js";

describe("GdcVisualizationObject", () => {
    describe("isMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "attribute", attribute],
            [true, "measure", simpleMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isAttribute", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "attribute", attribute],
            [false, "measure", simpleMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttribute(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isArithmeticMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [true, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isArithmeticMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isPopMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [true, "pop measure definition", popMeasureDefinition],
            [false, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPopMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isPreviousPeriodMeasureDefinition", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure definition", simpleMeasureDefinition],
            [false, "arithmetic measure definition", arithmeticMeasureDefinition],
            [false, "pop measure definition", popMeasureDefinition],
            [true, "previous period measure definition", previousPeriodMeasureDefinition],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPreviousPeriodMeasureDefinition(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [true, "positive attribute filter", positiveAttributeFilter],
            [true, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "relative date filter", relativeDateFilter],
            [true, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isPositiveAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [true, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPositiveAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isNegativeAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [true, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNegativeAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAbsoluteDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [true, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAbsoluteDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isRelativeDateFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [false, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isRelativeDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "relative date filter", relativeDateFilter],
            [false, "absolute date filter", absoluteDateFilter],
            [false, "positive attribute filter", positiveAttributeFilter],
            [false, "negative attribute filter", negativeAttributeFilter],
            [true, "measure value filter", measureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isMeasureValueFilter(input)).toBe(expectedResult);
        });
    });
});
