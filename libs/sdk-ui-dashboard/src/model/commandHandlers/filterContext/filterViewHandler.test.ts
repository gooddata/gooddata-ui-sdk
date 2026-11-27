// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    type IDashboardFilterView,
    type IDashboardParameter,
    idRef,
    isDashboardCommonDateFilterOfAnyType,
    isDashboardDateFilterWithDimensionOfAnyType,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { applyFilterView } from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { filterViewsActions } from "../../store/filterViews/index.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import {
    selectFilterContextDateFilterOfAnyType,
    selectFilterContextDateFiltersWithDimensionOfAnyType,
    selectFilterContextDefinition,
    selectFilterContextFilters,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectParameterRuntimeOverrideByRef } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";

const topNRef = idRef("topN", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
    value: 5,
};

describe("apply filter view handler", () => {
    let Tester: DashboardTester;
    let warn: MockInstance<typeof console.warn>;

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({
                    settings: { enableParameters: true, enableAbsoluteDateFilterGranularity: true },
                }),
            },
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 10 }));
        Tester.dispatch(tabsActions.setParameterRuntimeValues({ values: [{ ref: topNRef, value: 3 }] }));
        warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it("should apply the absolute date filter with granularity for a date dataset of a view", async () => {
        const dataSet = idRef("closed", "dataSet");
        Tester.dispatch(tabsActions.addDateFilter({ index: -1, dateDataset: dataSet }));
        const dashboardRef = selectDashboardRef(Tester.state())!;
        const filterContext = selectFilterContextDefinition(Tester.state());
        const filterView: IDashboardFilterView = {
            ref: idRef("filter-view-1", "filterView"),
            name: "View",
            dashboard: dashboardRef,
            user: idRef("user-1"),
            tabLocalIdentifier: selectActiveTabLocalIdentifier(Tester.state()),
            filterContext: {
                ...filterContext,
                filters: [
                    ...filterContext.filters.filter(
                        (filter) => !isDashboardDateFilterWithDimensionOfAnyType(filter),
                    ),
                    {
                        dashboardAbsoluteGranularityDateFilter: {
                            granularity: "GDC.time.month",
                            from: "2026-01",
                            to: "2026-03",
                            dataSet,
                        },
                    },
                ],
            },
            parameters: [{ ...topNParameter, value: 7 }],
        };
        Tester.dispatch(filterViewsActions.addFilterView({ dashboard: dashboardRef, filterView }));

        await Tester.dispatchAndWaitFor(
            applyFilterView(filterView.ref),
            "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
        );

        expect(selectFilterContextDateFiltersWithDimensionOfAnyType(Tester.state())).toEqual([
            {
                dashboardAbsoluteGranularityDateFilter: {
                    granularity: "GDC.time.month",
                    from: "2026-01",
                    to: "2026-03",
                    dataSet,
                },
            },
        ]);
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(7);
        expect(warn).not.toHaveBeenCalled();
    });

    it("should apply the common absolute date filter with granularity of a view", async () => {
        const dashboardRef = selectDashboardRef(Tester.state())!;
        const filterContext = selectFilterContextDefinition(Tester.state());
        const commonDateFilter: IDashboardAbsoluteGranularityDateFilter = {
            dashboardAbsoluteGranularityDateFilter: {
                granularity: "GDC.time.quarter",
                from: "2026-1",
                to: "2026-2",
            },
        };
        const filterView: IDashboardFilterView = {
            ref: idRef("filter-view-2", "filterView"),
            name: "View",
            dashboard: dashboardRef,
            user: idRef("user-1"),
            tabLocalIdentifier: selectActiveTabLocalIdentifier(Tester.state()),
            filterContext: {
                ...filterContext,
                filters: [
                    commonDateFilter,
                    ...filterContext.filters.filter(
                        (filter) => !isDashboardCommonDateFilterOfAnyType(filter),
                    ),
                ],
            },
        };
        Tester.dispatch(filterViewsActions.addFilterView({ dashboard: dashboardRef, filterView }));

        await Tester.dispatchAndWaitFor(
            applyFilterView(filterView.ref),
            "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
        );

        expect(selectFilterContextDateFilterOfAnyType(Tester.state())).toMatchObject(commonDateFilter);
        expect(warn).not.toHaveBeenCalled();
    });

    it("should not apply anything from a view with a parameterized date filter", async () => {
        const dashboardRef = selectDashboardRef(Tester.state());
        if (!dashboardRef) {
            throw new Error("The dashboard has no ref.");
        }
        const filterContext = selectFilterContextDefinition(Tester.state());
        const filterView: IDashboardFilterView = {
            ref: idRef("filter-view-2", "filterView"),
            name: "View",
            dashboard: dashboardRef,
            user: idRef("user-1"),
            tabLocalIdentifier: selectActiveTabLocalIdentifier(Tester.state()),
            filterContext: {
                ...filterContext,
                filters: [
                    ...filterContext.filters,
                    newDashboardParameterizedDateFilter(idRef("period", "parameter")),
                ],
            },
            parameters: [{ ...topNParameter, value: 7 }],
        };
        Tester.dispatch(filterViewsActions.addFilterView({ dashboard: dashboardRef, filterView }));
        const filtersBefore = selectFilterContextFilters(Tester.state());

        await Tester.dispatchAndWaitFor(
            applyFilterView(filterView.ref),
            "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.FAILURE",
        );

        expect(selectFilterContextFilters(Tester.state())).toEqual(filtersBefore);
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(3);
        expect(warn).toHaveBeenCalled();
    });
});
