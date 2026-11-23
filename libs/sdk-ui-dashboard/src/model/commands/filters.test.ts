// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type DateAttributeGranularity,
    type IDateFilter,
    idRef,
    newAbsoluteDateFilter,
    newAbsoluteGranularityDateFilter,
} from "@gooddata/sdk-model";

import { applyDateFilter } from "./filters.js";

describe("applyDateFilter", () => {
    it.each([
        ["GDC.time.month", "GDC.time.month"],
        ["GDC.time.month_in_year", "GDC.time.date"],
        ["GDC.time.week", "GDC.time.date"],
        [undefined, "GDC.time.date"],
    ] as [DateAttributeGranularity | undefined, string][])(
        "applies an absolute date filter at %s as %s",
        (granularity, expected) => {
            const filter = newAbsoluteDateFilter(idRef("closed", "dataSet"), "2026-03-01", "2026-04-30", {
                granularity,
            });

            expect(applyDateFilter(filter).payload.granularity).toBe(expected);
        },
    );

    it("throws for an absolute granularity date filter passed without types", () => {
        const filter = newAbsoluteGranularityDateFilter(
            idRef("closed", "dataSet"),
            "GDC.time.month",
            "2026-03",
            "2026-04",
        );

        expect(() => applyDateFilter(filter as unknown as IDateFilter)).toThrow(
            "Absolute date filters with granularity are not supported yet.",
        );
    });
});
