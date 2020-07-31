// (C) 2019-2020 GoodData Corporation

import {
    Won,
    Velocity,
    AggregateAdhoc,
    EmptyFiltersAdhoc,
    NonEmptyFiltersAdhoc,
    FalseComputeRatioAdhoc,
    TrueComputeRatioAdhoc,
} from "../../../../__mocks__/model";
import { InvalidInputTestCases } from "../../../../__mocks__/typeGuards";
import { newArithmeticMeasure, newPopMeasure, newPreviousPeriodMeasure } from "../factory";
import {
    isArithmeticMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    isSimpleMeasure,
    measureLocalId,
    isAdhocMeasure,
} from "../index";

const SimpleMeasure = Won;
const ArithmeticMeasure = newArithmeticMeasure([Won, Velocity.Min], "sum");
const PopMeasure = newPopMeasure(measureLocalId(Won), "myPopAttribute");
const PreviousPeriodMeasure = newPreviousPeriodMeasure(Won, [{ dataSet: "dataSet", periodsAgo: 1 }]);

describe("measure type guards", () => {
    describe("isSimpleMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "simple measure", SimpleMeasure],
            [false, "arithmetic measure", ArithmeticMeasure],
            [false, "PoP measure", PopMeasure],
            [false, "PreviousPeriodMeasure", PreviousPeriodMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isSimpleMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isAdhocMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure", SimpleMeasure],
            [true, "adhoc measure with aggregation", AggregateAdhoc],
            [false, "adhoc measure with empty filters", EmptyFiltersAdhoc],
            [true, "adhoc measure with non-empty filters", NonEmptyFiltersAdhoc],
            [false, "adhoc measure with false computeRatio", FalseComputeRatioAdhoc],
            [true, "adhoc measure with true computeRatio", TrueComputeRatioAdhoc],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAdhocMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isArithmeticMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure", SimpleMeasure],
            [true, "arithmetic measure", ArithmeticMeasure],
            [false, "PoP measure", PopMeasure],
            [false, "PreviousPeriodMeasure", PreviousPeriodMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isArithmeticMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isPoPMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure", SimpleMeasure],
            [false, "arithmetic measure", ArithmeticMeasure],
            [true, "PoP measure", PopMeasure],
            [false, "PreviousPeriodMeasure", PreviousPeriodMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPoPMeasure(input)).toBe(expectedResult);
        });
    });

    describe("isPreviousPeriodMeasure", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "simple measure", SimpleMeasure],
            [false, "arithmetic measure", ArithmeticMeasure],
            [false, "PoP measure", PopMeasure],
            [true, "PreviousPeriodMeasure", PreviousPeriodMeasure],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isPreviousPeriodMeasure(input)).toBe(expectedResult);
        });
    });

    // measure definition type guards are tested through the above type guards
});
