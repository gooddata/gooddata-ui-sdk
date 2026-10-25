// (C) 2019-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    comparisonMeasureValueFilter,
    filtersMock,
    rangeMeasureValueFilter,
} from "../../tests/filter.test.helpers.js";

import {
    FilterBar,
    type IFilterBarItem,
    type MeasureValueFilterCondition,
    normalizeMeasureValueFilterConditions,
} from "./filter_bar_types.js";
import { invalidTypeGuardInputs } from "./invalid_type_guard.test.helpers.js";

describe("FilterBar", () => {
    const attributeFilter = filtersMock[0];
    const dateFilter = filtersMock[1];

    describe("isDateFilter", () => {
        const Scenarios: Array<[boolean, string, IFilterBarItem]> = [
            ...invalidTypeGuardInputs<IFilterBarItem>(),
            [false, "attribute filter", attributeFilter],
            [true, "date filter", dateFilter],
            [false, "comparison measure value filter", comparisonMeasureValueFilter],
            [false, "range measure value filter", rangeMeasureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(FilterBar.isDateFilter(input)).toBe(expectedResult);
        });
    });

    describe("isAttributeFilter", () => {
        const Scenarios: Array<[boolean, string, IFilterBarItem]> = [
            ...invalidTypeGuardInputs<IFilterBarItem>(),
            [true, "attribute filter", attributeFilter],
            [false, "date filter", dateFilter],
            [false, "comparison measure value filter", comparisonMeasureValueFilter],
            [false, "range measure value filter", rangeMeasureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(FilterBar.isAttributeFilter(input)).toBe(expectedResult);
        });
    });

    describe("isMeasureValueFilter", () => {
        const Scenarios: Array<[boolean, string, IFilterBarItem]> = [
            ...invalidTypeGuardInputs<IFilterBarItem>(),
            [false, "attribute filter", attributeFilter],
            [false, "date filter", dateFilter],
            [true, "comparison measure value filter", comparisonMeasureValueFilter],
            [true, "range measure value filter", rangeMeasureValueFilter],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(FilterBar.isMeasureValueFilter(input)).toBe(expectedResult);
        });
    });

    describe("isComparisonCondition", () => {
        const Scenarios: Array<[boolean, string, MeasureValueFilterCondition]> = [
            ...invalidTypeGuardInputs<MeasureValueFilterCondition>(),
            [
                true,
                "comparison condition",
                normalizeMeasureValueFilterConditions(comparisonMeasureValueFilter)?.[0],
            ],
            [false, "range condition", normalizeMeasureValueFilterConditions(rangeMeasureValueFilter)?.[0]],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(FilterBar.isComparisonCondition(input)).toBe(expectedResult);
        });
    });

    describe("isRangeCondition", () => {
        const Scenarios: Array<[boolean, string, MeasureValueFilterCondition]> = [
            ...invalidTypeGuardInputs<MeasureValueFilterCondition>(),
            [
                false,
                "comparison condition",
                normalizeMeasureValueFilterConditions(comparisonMeasureValueFilter)?.[0],
            ],
            [true, "range condition", normalizeMeasureValueFilterConditions(rangeMeasureValueFilter)?.[0]],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(FilterBar.isRangeCondition(input)).toBe(expectedResult);
        });
    });
});
