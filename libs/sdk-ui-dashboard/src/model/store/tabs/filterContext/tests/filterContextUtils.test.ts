// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardDateFilter,
    type IFilterContextDefinition,
    isDashboardCommonDateFilter,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import type { IWorkingFilterContextDefinition } from "../filterContextState.js";
import { applyFilterContext } from "../filterContextUtils.js";

const emptyFilterContext: IFilterContextDefinition = {
    title: "",
    description: "",
    filters: [],
};

describe("applyFilterContext", () => {
    describe("common date filter (all time represented as absence)", () => {
        it("keeps a working 'Empty values' all-time filter (carries emptyValueHandling) so the change is detectable", () => {
            // applied = all time represented by the absence of a common date filter
            const applied = emptyFilterContext;
            // working = the "Empty values" preset: an all-time filter carrying emptyValueHandling: "only"
            const emptyValuesFilter = newAllTimeDashboardDateFilter(undefined, undefined, "only");
            const working: IWorkingFilterContextDefinition = { filters: [emptyValuesFilter] };

            const result = applyFilterContext(applied, working);

            const resultDateFilter = result.filters.find(isDashboardCommonDateFilter) as
                | IDashboardDateFilter
                | undefined;
            expect(resultDateFilter).toBeDefined();
            expect(resultDateFilter?.dateFilter.emptyValueHandling).toBe("only");
        });

        it("drops a working plain (no-op) all-time filter when there is no applied common date filter", () => {
            const applied = emptyFilterContext;
            const working: IWorkingFilterContextDefinition = {
                filters: [newAllTimeDashboardDateFilter()],
            };

            const result = applyFilterContext(applied, working);

            expect(result.filters.find(isDashboardCommonDateFilter)).toBeUndefined();
        });
    });
});
