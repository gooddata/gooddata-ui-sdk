// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type DashboardDateFilterOfAnyType,
    type FilterContextItem,
    type IDashboardAbsoluteGranularityDateFilter,
    type IDashboardDateFilter,
    type IDashboardParameterizedDateFilter,
    type IFilterContextDefinition,
    idRef,
    isDashboardCommonDateFilter,
    isNoopAllTimeDashboardDateFilter,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import type { IWorkingFilterContextDefinition } from "./filterContextState.js";
import { applyFilterContext, getFilterIdentifier } from "./filterContextUtils.js";

const fiscalYear = idRef("fiscal_year", "parameter");
const periodFilter = (localIdentifier?: string): IDashboardParameterizedDateFilter =>
    newDashboardParameterizedDateFilter(fiscalYear, localIdentifier ? { localIdentifier } : {});

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

    describe("common date filter of the new type", () => {
        const weekFilter = (localIdentifier?: string): IDashboardAbsoluteGranularityDateFilter => ({
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.week",
                from: "2026-05",
                to: "2026-08",
                ...(localIdentifier ? { localIdentifier } : {}),
            },
        });
        const relativeFilter = (localIdentifier?: string): IDashboardDateFilter =>
            newRelativeDashboardDateFilter("GDC.time.year", -1, -1, undefined, localIdentifier);
        const withFilters = (filters: FilterContextItem[]): IFilterContextDefinition => ({
            ...emptyFilterContext,
            filters,
        });

        it.each<[string, FilterContextItem, DashboardDateFilterOfAnyType, FilterContextItem]>([
            [
                "the old type by the new type",
                relativeFilter("applied"),
                weekFilter("working"),
                weekFilter("applied"),
            ],
            [
                "the new type by the old type",
                weekFilter("applied"),
                relativeFilter("working"),
                relativeFilter("applied"),
            ],
            [
                "the old type by a period",
                relativeFilter("applied"),
                periodFilter("working"),
                periodFilter("applied"),
            ],
            [
                "a period by the old type",
                periodFilter("applied"),
                relativeFilter("working"),
                relativeFilter("applied"),
            ],
            [
                "the new type by the new type",
                weekFilter("applied"),
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.year",
                        to: "2026",
                    },
                },
                {
                    dashboardAbsoluteGranularityDateFilter: {
                        granularity: "GDC.time.year",
                        to: "2026",
                        localIdentifier: "applied",
                    },
                },
            ],
        ])("replaces %s keeping the applied local identifier", (_desc, applied, working, expected) => {
            const result = applyFilterContext(withFilters([applied]), { filters: [working] });

            expect(result.filters).toEqual([expected]);
        });

        it("replaces the new type by a working All time without keys with undefined values", () => {
            const workingAllTime: IDashboardDateFilter = {
                dateFilter: {
                    type: "relative",
                    granularity: "GDC.time.date",
                    from: undefined,
                    to: undefined,
                },
            };

            const result = applyFilterContext(withFilters([weekFilter("applied")]), {
                filters: [workingAllTime],
            });

            expect(result.filters).toStrictEqual([
                {
                    dateFilter: {
                        type: "relative",
                        granularity: "GDC.time.date",
                        localIdentifier: "applied",
                    },
                },
            ]);
            expect(isNoopAllTimeDashboardDateFilter(result.filters[0])).toBe(true);
        });

        it("adds the working new type when the applied common date filter is all time", () => {
            const result = applyFilterContext(emptyFilterContext, { filters: [weekFilter()] });

            expect(result.filters).toEqual([weekFilter()]);
        });

        it("keeps the applied new type without a working change", () => {
            const result = applyFilterContext(withFilters([weekFilter("applied")]), { filters: [] });

            expect(result.filters).toEqual([weekFilter("applied")]);
        });

        it("does not let a working common date filter change the new type with a dataset", () => {
            const withDataSet: IDashboardAbsoluteGranularityDateFilter = {
                dashboardAbsoluteGranularityDateFilter: {
                    ...weekFilter("dimension").dashboardAbsoluteGranularityDateFilter,
                    dataSet: idRef("closed", "dataSet"),
                },
            };

            const result = applyFilterContext(withFilters([withDataSet]), {
                filters: [relativeFilter("working")],
            });

            expect(result.filters).toContainEqual(withDataSet);
        });

        it("keeps a period with a dataset unchanged", () => {
            const withDataSet = newDashboardParameterizedDateFilter(fiscalYear, {
                dataSet: idRef("closed", "dataSet"),
                localIdentifier: "dimension",
            });

            const result = applyFilterContext(withFilters([withDataSet]), {
                filters: [relativeFilter("working")],
            });

            expect(result.filters).toContainEqual(withDataSet);
        });
    });
});

describe("getFilterIdentifier", () => {
    it("identifies a common period like the common date filter", () => {
        expect(getFilterIdentifier(periodFilter("period"))).toBe("default_date_filter");
    });

    it("identifies a period with a dataset by the dataset", () => {
        const withDataSet = newDashboardParameterizedDateFilter(fiscalYear, {
            dataSet: idRef("closed", "dataSet"),
        });

        expect(getFilterIdentifier(withDataSet)).toBe(
            getFilterIdentifier(
                newRelativeDashboardDateFilter("GDC.time.year", -1, -1, idRef("closed", "dataSet")),
            ),
        );
    });
});
