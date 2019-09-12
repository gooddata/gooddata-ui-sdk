// (C) 2007-2019 GoodData Corporation

import { convertAfm } from "../execute-afm.convert";
import * as input from "./fixtures";

const FILTER_TESTS = [
    ["leave empty filters as is", [], []],
    ["leave relative date filter as is", [input.relativeDate], [input.relativeDate]],
    ["leave absolute date filter as is", [input.absoluteDate], [input.absoluteDate]],
    ["convert positive URI filter", [input.positiveUri], [input.positiveUriExpected]],
    ["convert positive value filter", [input.positiveValue], [input.positiveValueExpected]],
    ["convert negative URI filter", [input.negativeUri], [input.negativeUriExpected]],
    ["convert negative value filter", [input.negativeValue], [input.negativeValueExpected]],
    [
        "convert mix of URI and value filters",
        [input.positiveUri, input.negativeValue],
        [input.positiveUriExpected, input.negativeValueExpected],
    ],
    [
        "convert mix of date and attribute filters",
        [input.absoluteDate, input.positiveUri, input.relativeDate, input.negativeValue],
        [input.absoluteDate, input.positiveUriExpected, input.relativeDate, input.negativeValueExpected],
    ],
    [
        "convert measure value filters",
        [input.comparisonMeasureValue, input.rangeMeasureValue],
        [input.comparisonMeasureValueExpected, input.rangeMeasureValueExpected],
    ],
];

describe.each(FILTER_TESTS)("convertAfm", (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertAfm({ filters: input })).toEqual({ filters: expected });
    });
});

const MEASURE_TESTS = [
    [
        "convert simple measure with filters",
        [input.simpleMeasureWithFilters],
        [input.simpleMeasureWithFiltersExpected],
    ],
    [
        "convert simple measure with mixed filters",
        [input.simpleMeasureWithMixedFilters],
        [input.simpleMeasureWithMixedFiltersExpected],
    ],
    [
        "convert simple measure with empty filters",
        [input.simpleMeasureWithEmptyFilters],
        [input.simpleMeasureWithEmptyFiltersExpected],
    ],
    [
        "convert simple measure with undefined filters",
        [input.simpleMeasureWithUndefinedFilters],
        [input.simpleMeasureWithUndefinedFiltersExpected],
    ],
    ["leave arithmetic measure as is", [input.arithmeticMeasure], [input.arithmeticMeasure]],
    ["leave PoP measure as is", [input.popMeasure], [input.popMeasure]],
    ["leave previousPeriod measure as is", [input.previousPeriodMeasure], [input.previousPeriodMeasure]],
];

describe.each(MEASURE_TESTS)("convertAfm", (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertAfm({ measures: input })).toEqual({ measures: expected });
    });
});
