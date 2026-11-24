// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FilterContextItem, idRef } from "@gooddata/sdk-model";

import { addFilterLocalIdentifier } from "./filterLocalidentifier.js";

describe("addFilterLocalIdentifier", () => {
    it.each<[string, FilterContextItem, string]>([
        [
            "a common filter",
            { dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.month", from: "2026-01" } },
            "2_dateFilter",
        ],
        [
            "a filter with a data set",
            {
                dashboardAbsoluteGranularityDateFilter: {
                    granularity: "GDC.time.month",
                    from: "2026-01",
                    dataSet: idRef("date1", "dataSet"),
                },
            },
            "date1_2_dateFilter",
        ],
    ])(
        "generates a missing local identifier of an absolute date filter with granularity for %s",
        (_desc, filter, localIdentifier) => {
            expect(addFilterLocalIdentifier(filter, 2)).toEqual({
                dashboardAbsoluteGranularityDateFilter: {
                    ...(filter as { dashboardAbsoluteGranularityDateFilter: object })
                        .dashboardAbsoluteGranularityDateFilter,
                    localIdentifier,
                },
            });
        },
    );

    it("keeps the local identifier of an absolute date filter with granularity", () => {
        const filter: FilterContextItem = {
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.month",
                to: "2026-03",
                localIdentifier: "kept",
            },
        };

        expect(addFilterLocalIdentifier(filter, 2)).toBe(filter);
    });
});
