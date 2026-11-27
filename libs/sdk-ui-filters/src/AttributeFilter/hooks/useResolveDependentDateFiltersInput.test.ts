// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    type DashboardDateFilterOfAnyType,
    idRef,
    newAbsoluteDashboardDateFilter,
    newAbsoluteGranularityDateFilter,
    newAllTimeDashboardDateFilter,
    newAllTimeFilter,
    newDashboardParameterizedDateFilter,
    newRelativeDashboardDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { useResolveDependentDateFiltersInput } from "./useResolveDependentDateFiltersInput.js";

const dataSet = idRef("date", "dataSet");

function resolve(filters: DashboardDateFilterOfAnyType[]) {
    return renderHook(() => useResolveDependentDateFiltersInput(filters)).result.current;
}

describe("useResolveDependentDateFiltersInput", () => {
    it.each([
        ["GDC.time.month", "2026-03-01", "2026-03-31"],
        ["GDC.time.week_us", "2026-07-19", "2026-07-25"],
    ] as const)("keeps the %s granularity of an absolute filter", (granularity, from, to) => {
        const filter = newAbsoluteDashboardDateFilter(from, to, dataSet, "local", undefined, granularity);

        expect(resolve([filter])).toEqual([
            { absoluteDateFilter: { dataSet, from, to, localIdentifier: "local", granularity } },
        ]);
    });

    it("resolves an absolute day range to a day filter", () => {
        const filter = newAbsoluteDashboardDateFilter("2026-03-01", "2026-03-05", dataSet, "local");

        expect(resolve([filter])).toEqual([
            {
                absoluteDateFilter: {
                    dataSet,
                    from: "2026-03-01",
                    to: "2026-03-05",
                    localIdentifier: "local",
                },
            },
        ]);
    });

    it("resolves a relative filter", () => {
        const filter = newRelativeDashboardDateFilter("GDC.time.month", -3, -1, dataSet, "local");

        expect(resolve([filter])).toEqual([
            newRelativeDateFilter(dataSet, "GDC.time.month", -3, -1, "local"),
        ]);
    });

    it("resolves an All time filter that handles empty values", () => {
        const filter = newAllTimeDashboardDateFilter(dataSet, "local", "include");

        expect(resolve([filter])).toEqual([newAllTimeFilter(dataSet, "local", "include")]);
    });

    it("drops an All time filter that filters nothing", () => {
        expect(resolve([newAllTimeDashboardDateFilter(dataSet, "local")])).toEqual([]);
    });

    it("drops a parameterized date filter, it holds no period", () => {
        const parameterized = newDashboardParameterizedDateFilter(idRef("period", "parameter"), { dataSet });

        expect(resolve([parameterized])).toEqual([]);
    });

    it("resolves an absolute filter with granularity", () => {
        const filter: DashboardDateFilterOfAnyType = {
            dashboardAbsoluteGranularityDateFilter: {
                dataSet,
                localIdentifier: "local",
                granularity: "GDC.time.quarter",
                from: "2026-1",
                to: "2026-2",
            },
        };

        expect(resolve([filter])).toEqual([
            newAbsoluteGranularityDateFilter(dataSet, "GDC.time.quarter", "2026-1", "2026-2", {
                localIdentifier: "local",
            }),
        ]);
    });

    it("resolves an absolute filter with granularity open at the start", () => {
        const filter: DashboardDateFilterOfAnyType = {
            dashboardAbsoluteGranularityDateFilter: {
                dataSet,
                granularity: "GDC.time.year",
                to: "2025",
            },
        };

        expect(resolve([filter])).toEqual([
            newAbsoluteGranularityDateFilter(dataSet, "GDC.time.year", undefined, "2025"),
        ]);
    });
});
