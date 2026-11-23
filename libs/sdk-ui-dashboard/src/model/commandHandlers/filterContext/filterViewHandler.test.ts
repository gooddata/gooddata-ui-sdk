// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IDashboardFilterView, type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { applyFilterView } from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { filterViewsActions } from "../../store/filterViews/index.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import {
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
                initCommand: initializeDashboard({ settings: { enableParameters: true } }),
            },
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        warn.mockRestore();
    });

    it("should not apply anything from a view with an absolute date filter with granularity", async () => {
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
                    ...filterContext.filters,
                    {
                        dashboardAbsoluteGranularityDateFilter: {
                            granularity: "GDC.time.month",
                            from: "2026-01",
                            to: "2026-03",
                        },
                    },
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
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
        expect(warn).toHaveBeenCalled();
    });
});
