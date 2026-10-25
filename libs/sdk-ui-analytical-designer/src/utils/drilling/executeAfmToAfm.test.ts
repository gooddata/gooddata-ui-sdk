// (C) 2020-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
    type CompatibilityFilter as CompatibilityFilterAFM,
    type IMeasure as IMeasureAFM,
} from "../../typings/bear/bearTypes.js";

import { convertAfm } from "./executeAfmToAfm.js";
import {
    absoluteDate,
    arithmeticMeasure,
    comparisonMeasureValue,
    comparisonMeasureValueExpected,
    negativeUri,
    negativeUriExpected,
    negativeValue,
    negativeValueExpected,
    popMeasure,
    positiveUri,
    positiveUriExpected,
    positiveValue,
    positiveValueExpected,
    previousPeriodMeasure,
    rangeMeasureValue,
    rangeMeasureValueExpected,
    rankingFilterWithAttributes,
    rankingFilterWithAttributesExpected,
    rankingFilterWithoutAttributes,
    rankingFilterWithoutAttributesExpected,
    relativeDate,
    simpleMeasureWithEmptyFilters,
    simpleMeasureWithEmptyFiltersExpected,
    simpleMeasureWithFilters,
    simpleMeasureWithFiltersExpected,
    simpleMeasureWithMixedFilters,
    simpleMeasureWithMixedFiltersExpected,
    simpleMeasureWithUndefinedFilters,
    simpleMeasureWithUndefinedFiltersExpected,
} from "./executeAfmToAfm.test.helpers.js";
import { type CompatibilityFilter, type IMeasure } from "./types.js";

const FILTER_TESTS: [string, CompatibilityFilterAFM[], CompatibilityFilter[]][] = [
    ["leave empty filters as is", [], []],
    ["leave relative date filter as is", [relativeDate], [relativeDate]],
    ["leave absolute date filter as is", [absoluteDate], [absoluteDate]],
    ["convert positive URI filter", [positiveUri], [positiveUriExpected]],
    ["convert positive value filter", [positiveValue], [positiveValueExpected]],
    ["convert negative URI filter", [negativeUri], [negativeUriExpected]],
    ["convert negative value filter", [negativeValue], [negativeValueExpected]],
    [
        "convert mix of URI and value filters",
        [positiveUri, negativeValue],
        [positiveUriExpected, negativeValueExpected],
    ],
    [
        "convert mix of date and attribute filters",
        [absoluteDate, positiveUri, relativeDate, negativeValue],
        [absoluteDate, positiveUriExpected, relativeDate, negativeValueExpected],
    ],
    [
        "convert measure value filters",
        [comparisonMeasureValue, rangeMeasureValue],
        [comparisonMeasureValueExpected, rangeMeasureValueExpected],
    ],
    [
        "convert ranking filters",
        [rankingFilterWithAttributes, rankingFilterWithoutAttributes],
        [rankingFilterWithAttributesExpected, rankingFilterWithoutAttributesExpected],
    ],
];

describe.each(FILTER_TESTS)("convertAfm", (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertAfm({ filters: input })).toEqual({ filters: expected });
    });
});

const MEASURE_TESTS: [string, IMeasureAFM[], (IMeasure | IMeasureAFM)[]][] = [
    ["convert simple measure with filters", [simpleMeasureWithFilters], [simpleMeasureWithFiltersExpected]],
    [
        "convert simple measure with mixed filters",
        [simpleMeasureWithMixedFilters],
        [simpleMeasureWithMixedFiltersExpected],
    ],
    [
        "convert simple measure with empty filters",
        [simpleMeasureWithEmptyFilters],
        [simpleMeasureWithEmptyFiltersExpected],
    ],
    [
        "convert simple measure with undefined filters",
        [simpleMeasureWithUndefinedFilters],
        [simpleMeasureWithUndefinedFiltersExpected],
    ],
    ["leave arithmetic measure as is", [arithmeticMeasure], [arithmeticMeasure]],
    ["leave PoP measure as is", [popMeasure], [popMeasure]],
    ["leave previousPeriod measure as is", [previousPeriodMeasure], [previousPeriodMeasure]],
];

describe.each(MEASURE_TESTS)("convertAfm", (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertAfm({ measures: input })).toEqual({ measures: expected });
    });
});
