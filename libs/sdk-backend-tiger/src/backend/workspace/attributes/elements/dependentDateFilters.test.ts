// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type DateAttributeGranularity,
    idRef,
    newAbsoluteDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { mapDashboardDateFilterToDependentDateFilter } from "./dependentDateFilters.js";

const dataSet = idRef("closed", "dataSet");
const dataset = { identifier: { id: "closed", type: "dataset" } };

const absoluteFilter = (from: string, to: string, granularity?: DateAttributeGranularity) =>
    newAbsoluteDateFilter(dataSet, from, to, { granularity });

describe("mapDashboardDateFilterToDependentDateFilter", () => {
    it.each([
        ["GDC.time.month", "2026-03-01", "2026-04-30", "MONTH", "2026-03", "2026-04"],
        ["GDC.time.quarter", "2026-04-01", "2026-06-30", "QUARTER", "2026-2", "2026-2"],
        ["GDC.time.year", "2025-01-01", "2025-12-31", "YEAR", "2025", "2025"],
    ] as [DateAttributeGranularity, string, string, string, string, string][])(
        "sends %s %s - %s as %s periods",
        (granularity, from, to, tigerGranularity, fromLiteral, toLiteral) => {
            expect(
                mapDashboardDateFilterToDependentDateFilter(absoluteFilter(from, to, granularity)),
            ).toEqual({
                dateFilter: {
                    absoluteGranularityDateFilter: {
                        dataset,
                        granularity: tigerGranularity,
                        from: fromLiteral,
                        to: toLiteral,
                    },
                },
            });
        },
    );

    it.each([
        ["GDC.time.week_us", "2026-07-19", "2026-07-25"],
        ["GDC.time.week_us", "2026-07-20", "2026-07-26"],
        ["GDC.time.week_us", "2026-07-22", "2026-07-28"],
        ["GDC.time.date", "2026-07-22", "2026-07-28"],
        [undefined, "2026-07-22", "2026-07-28"],
        ["GDC.time.hour", "2026-03-01 08:00", "2026-03-01 18:00"],
        ["GDC.time.fiscal_month", "2026-03-01", "2026-04-30"],
        ["GDC.time.week", "2026-07-20", "2026-07-26"],
        ["GDC.time.month", "2026-03-10", "2026-04-20"],
        ["GDC.time.year", "2024-01-01", "2024-06-30"],
        ["GDC.time.month", "2026-03-01 08:00", "2026-04-30 12:00"],
        ["GDC.time.month", "2026-03-01 00:00", "2026-04-30 23:59"],
    ] as [DateAttributeGranularity | undefined, string, string][])(
        "sends %s %s - %s as days",
        (granularity, from, to) => {
            expect(
                mapDashboardDateFilterToDependentDateFilter(absoluteFilter(from, to, granularity)),
            ).toStrictEqual({
                dateFilter: {
                    absoluteDateFilter: { dataset, from, to },
                },
            });
        },
    );

    it("sends a relative date filter as a relative one", () => {
        expect(
            mapDashboardDateFilterToDependentDateFilter(
                newRelativeDateFilter(dataSet, "GDC.time.week_us", -10, -10),
            ),
        ).toStrictEqual({
            dateFilter: {
                relativeDateFilter: { dataset, granularity: "WEEK", from: -10, to: -10 },
            },
        });
    });
});
