// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef, newAbsoluteDateFilter, newParameterizedDateFilter } from "@gooddata/sdk-model";

import { areFiltersEqual } from "./utils.js";

describe("areFiltersEqual with parameterized date filters", () => {
    const ref = idRef("date", "dataSet");

    it("compares them by the referenced parameter", () => {
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, "period1"),
                newParameterizedDateFilter(ref, "period1"),
            ),
        ).toBe(true);
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, "period1"),
                newParameterizedDateFilter(ref, "period2"),
            ),
        ).toBe(false);
    });

    it("matches a parameter ref with and without its type", () => {
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, idRef("period")),
                newParameterizedDateFilter(ref, idRef("period", "parameter")),
            ),
        ).toBe(true);
    });

    it("compares them by the data set", () => {
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, "period"),
                newParameterizedDateFilter(idRef("other", "dataSet"), "period"),
            ),
        ).toBe(false);
    });

    it("treats a missing empty value handling as exclude", () => {
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, "period"),
                newParameterizedDateFilter(ref, "period", { emptyValueHandling: "exclude" }),
            ),
        ).toBe(true);
    });

    it("treats a parameterized and a fixed date filter as unequal", () => {
        expect(
            areFiltersEqual(
                newParameterizedDateFilter(ref, "period"),
                newAbsoluteDateFilter(ref, "2026-01-01", "2026-03-31"),
            ),
        ).toBe(false);
    });
});
