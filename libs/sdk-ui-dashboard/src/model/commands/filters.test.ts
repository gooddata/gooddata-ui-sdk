// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type DateAttributeGranularity, idRef, newAbsoluteDateFilter } from "@gooddata/sdk-model";

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
});
