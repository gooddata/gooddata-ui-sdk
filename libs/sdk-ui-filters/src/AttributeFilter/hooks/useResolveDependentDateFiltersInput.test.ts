// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
    type IDashboardDateFilter,
    idRef,
    newAbsoluteDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newAllTimeFilter,
    newRelativeDashboardDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";

import { useResolveDependentDateFiltersInput } from "./useResolveDependentDateFiltersInput.js";

const dataSet = idRef("date", "dataSet");

function resolve(filters: IDashboardDateFilter[]) {
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
});
