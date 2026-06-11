// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it, vi } from "vitest";

import { type IRelativeDateFilter, idRef, newRelativeDateFilter } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";
import { getDrillToUrlFiltersWithResolvedValues } from "../getDrillToUrlFilters.js";

const ctx = {} as unknown as DashboardContext;

describe("getDrillToUrlFiltersWithResolvedValues", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("fails the drill (re-throws) and logs when value resolution throws", () => {
        // If filter values cannot be resolved, the drill must NOT open — a partially/incorrectly
        // filtered target page could send the user to the wrong place. The error is logged and re-thrown.
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const dateFilter: IRelativeDateFilter = newRelativeDateFilter(
            idRef("created"),
            "GDC.time.month",
            -1,
            0,
        );

        const gen = getDrillToUrlFiltersWithResolvedValues(ctx, idRef("widget"));
        gen.next(); // -> call(query, queryWidgetFilters)
        gen.next([dateFilter]); // provide effective filters -> select(enableFilterValuesResolution...)
        gen.next(true); // flag on -> call(resolveFilterValues)

        // Inject a failure at the resolveFilterValues call; it must propagate out of the saga.
        expect(() => gen.throw(new Error("backend rejected the filter"))).toThrow(
            "backend rejected the filter",
        );
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("returns resolved values when resolution succeeds", () => {
        const dateFilter: IRelativeDateFilter = newRelativeDateFilter(
            idRef("created"),
            "GDC.time.month",
            -1,
            0,
        );
        const resolvedFilterValues = { dateFilters: [{ from: "2026-06-01", to: "2026-06-11" }] };

        const gen = getDrillToUrlFiltersWithResolvedValues(ctx, idRef("widget"));
        gen.next();
        gen.next([dateFilter]);
        gen.next(true);

        const result = gen.next(resolvedFilterValues);

        expect(result.done).toBe(true);
        expect(result.value).toEqual({ filters: [dateFilter], resolvedFilterValues });
    });

    it("returns filters without resolution when the feature flag is off", () => {
        const dateFilter: IRelativeDateFilter = newRelativeDateFilter(
            idRef("created"),
            "GDC.time.month",
            -1,
            0,
        );

        const gen = getDrillToUrlFiltersWithResolvedValues(ctx, idRef("widget"));
        gen.next();
        gen.next([dateFilter]);

        const result = gen.next(false); // flag off

        expect(result.done).toBe(true);
        expect(result.value).toEqual({ filters: [dateFilter] });
    });
});
