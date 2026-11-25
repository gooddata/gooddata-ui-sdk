// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "../../objRef/factory.js";
import { factoryNotationFor } from "../objectFactoryNotation/index.js";

import {
    newAbsoluteDateFilter,
    newAllTimeFilter,
    newParameterizedDateFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "./factory.js";
import { mergeFilters } from "./filterMerge.js";
import { filterFingerprint } from "./fingerprint.js";
import {
    type IFilter,
    filterLocalIdentifier,
    filterObjRef,
    isAllTimeDateFilter,
    isAllTimeDateFilterWithEmptyValueHandling,
    isDateFilter,
    isDateFilterOfAnyType,
    isDateFilterWithEmptyValueHandling,
    isFilter,
    isFilterOfAnyType,
    isNoopAllTimeDateFilter,
    isParameterizedDateFilter,
    isSimpleMeasureFilter,
    isSimpleMeasureFilterOfAnyType,
} from "./index.js";

const closed = idRef("closed", "dataSet");
const period = idRef("period", "parameter");
const parameterized = newParameterizedDateFilter(closed, period, {
    localIdentifier: "periodFilter",
    emptyValueHandling: "include",
});

describe("newParameterizedDateFilter", () => {
    it("creates the filter from identifiers", () => {
        expect(newParameterizedDateFilter("closed", "period")).toEqual({
            parameterizedDateFilter: {
                dataSet: { identifier: "closed" },
                parameter: { identifier: "period", type: "parameter" },
            },
        });
    });

    it("keeps refs and options", () => {
        expect(parameterized).toEqual({
            parameterizedDateFilter: {
                dataSet: closed,
                parameter: period,
                localIdentifier: "periodFilter",
                emptyValueHandling: "include",
            },
        });
    });
});

describe("parameterized date filter type guards", () => {
    it.each<[string, (obj: unknown) => boolean, boolean]>([
        ["isParameterizedDateFilter", isParameterizedDateFilter, true],
        ["isDateFilterOfAnyType", isDateFilterOfAnyType, true],
        ["isFilterOfAnyType", isFilterOfAnyType, true],
        ["isSimpleMeasureFilterOfAnyType", isSimpleMeasureFilterOfAnyType, true],
        ["isDateFilter", isDateFilter, false],
        ["isFilter", isFilter, false],
        ["isSimpleMeasureFilter", isSimpleMeasureFilter, false],
        ["isDateFilterWithEmptyValueHandling", isDateFilterWithEmptyValueHandling, false],
    ])("%s returns %s", (_name, guard, expected) => {
        expect(guard(parameterized)).toBe(expected);
    });

    it.each<[string, unknown]>([
        ["null", null],
        ["empty object", {}],
        ["absolute date filter", newAbsoluteDateFilter(closed, "2026-01-01", "2026-03-31")],
        ["all time date filter", newAllTimeFilter(closed)],
    ])("isParameterizedDateFilter rejects %s", (_name, input) => {
        expect(isParameterizedDateFilter(input)).toBe(false);
    });
});

describe("parameterized date filter helpers", () => {
    it("gets the data set and local identifier", () => {
        expect(filterObjRef(parameterized)).toEqual(closed);
        expect(filterLocalIdentifier(parameterized)).toBe("periodFilter");
    });

    it("has a fingerprint that depends on the parameter", () => {
        expect(filterFingerprint(newParameterizedDateFilter(closed, "period1"))).not.toEqual(
            filterFingerprint(newParameterizedDateFilter(closed, "period2")),
        );
    });
});

describe("parameterized date filter never becomes All time", () => {
    it("is not an all time filter", () => {
        expect(isAllTimeDateFilter(parameterized)).toBe(false);
        expect(isAllTimeDateFilterWithEmptyValueHandling(parameterized)).toBe(false);
        expect(isNoopAllTimeDateFilter(parameterized)).toBe(false);
    });

    it("survives merging into no filters", () => {
        expect(mergeFilters([], [parameterized])).toEqual([parameterized]);
    });

    it.each<[string, IFilter]>([
        ["absolute", newAbsoluteDateFilter(closed, "2026-01-01", "2026-03-31")],
        ["relative", newRelativeDateFilter(closed, "GDC.time.month", -1, 0)],
    ])("replaces an original %s date filter on the same data set", (_name, original) => {
        const attribute = newPositiveAttributeFilter("label", ["value"]);

        expect(mergeFilters([attribute, original], [parameterized])).toEqual([attribute, parameterized]);
    });

    it("is kept when an added filter is on another data set", () => {
        const other = newAllTimeFilter(idRef("created", "dataSet"));

        expect(mergeFilters([parameterized], [other])).toEqual([parameterized]);
    });

    it("is written as the filter itself in factory notation", () => {
        const code = factoryNotationFor(parameterized);

        expect(code).toContain("parameterizedDateFilter");
        expect(code).not.toContain("newAllTimeFilter");
    });
});
