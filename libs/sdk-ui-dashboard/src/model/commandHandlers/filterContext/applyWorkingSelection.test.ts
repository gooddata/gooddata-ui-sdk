// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardFilterView, type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import {
    applyFilterContextWorkingSelection,
    applyFilterView,
    changeWorkingAttributeFilterSelection,
    resetFilterContextWorkingSelection,
} from "../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { isDashboardParametersChanged } from "../../events/parameters.js";
import { selectConfig } from "../../store/config/configSelectors.js";
import { configActions } from "../../store/config/index.js";
import { selectIsCrossFiltering } from "../../store/drill/drillSelectors.js";
import { drillActions } from "../../store/drill/index.js";
import { filterViewsActions } from "../../store/filterViews/index.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import {
    selectFilterContextAttributeFilters,
    selectFilterContextDefinition,
    selectIsWorkingFilterContextChanged,
} from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import {
    selectIsWorkingParametersChanged,
    selectParameterRuntimeOverrideByRef,
    selectParameterValuesByTab,
} from "../../store/tabs/parameters/parametersSelectors.js";
import {
    selectActiveOrDefaultTabLocalIdentifier,
    selectActiveTabLocalIdentifier,
} from "../../store/tabs/tabsSelectors.js";
import { selectIsWorkingSelectionChanged } from "../../store/tabs/workingSelectionSelectors.js";

const topNRef = idRef("topN", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
    value: 5,
};

const STAGED_ELEMENT_URI = "staged/uri";

describe("apply/reset of the working selection", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({
                    settings: {
                        dashboardFiltersApplyMode: { mode: "ALL_AT_ONCE" },
                        enableParameters: true,
                    },
                }),
            },
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
    });

    function firstAttributeFilterLocalId(): string {
        return selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter.localIdentifier!;
    }

    async function stageFilterAndParameter(): Promise<void> {
        await Tester.dispatchAndWaitFor(
            changeWorkingAttributeFilterSelection(
                firstAttributeFilterLocalId(),
                { uris: [STAGED_ELEMENT_URI] },
                "IN",
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );
        Tester.dispatch(tabsActions.setParameterWorkingValue({ ref: topNRef, value: 42 }));

        expect(selectIsWorkingFilterContextChanged(Tester.state())).toBe(true);
        expect(selectIsWorkingParametersChanged(Tester.state())).toBe(true);
        expect(selectIsWorkingSelectionChanged(Tester.state())).toBe(true);
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
    }

    it("commits the staged filters and the staged parameters together", async () => {
        await stageFilterAndParameter();

        await Tester.dispatchAndWaitFor(
            applyFilterContextWorkingSelection(),
            "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED",
        );

        expect(selectFilterContextAttributeFilters(Tester.state())[0].attributeFilter).toMatchObject({
            attributeElements: { uris: [STAGED_ELEMENT_URI] },
            negativeSelection: false,
        });
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(42);
        expect(selectIsWorkingParametersChanged(Tester.state())).toBe(false);
        expect(selectIsWorkingFilterContextChanged(Tester.state())).toBe(false);
        expect(selectIsWorkingSelectionChanged(Tester.state())).toBe(false);
    });

    it("keeps cross-filtering when only parameters are staged", async () => {
        Tester.dispatch(
            drillActions.crossFilterByWidget({
                item: { widgetRef: idRef("widget-1"), filterLocalIdentifiers: ["cross-filter-1"] },
                tabId: selectActiveOrDefaultTabLocalIdentifier(Tester.state()),
            }),
        );
        Tester.dispatch(tabsActions.setParameterWorkingValue({ ref: topNRef, value: 42 }));

        await Tester.dispatchAndWaitFor(
            applyFilterContextWorkingSelection(),
            "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED",
        );

        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(42);
        expect(selectIsCrossFiltering(Tester.state())).toBe(true);
    });

    it("drops the staged filters and the staged parameters on reset", async () => {
        await stageFilterAndParameter();
        const appliedFilters = selectFilterContextAttributeFilters(Tester.state());

        await Tester.dispatchAndWaitFor(resetFilterContextWorkingSelection(), "tabs/resetWorkingSelection");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(appliedFilters);
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
        expect(selectIsWorkingParametersChanged(Tester.state())).toBe(false);
        expect(selectIsWorkingFilterContextChanged(Tester.state())).toBe(false);
        expect(selectIsWorkingSelectionChanged(Tester.state())).toBe(false);
    });

    it("clears the staged parameters when a filter view is applied", async () => {
        await stageFilterAndParameter();

        const dashboardRef = selectDashboardRef(Tester.state())!;
        const filterView: IDashboardFilterView = {
            ref: idRef("filter-view-1", "filterView"),
            name: "View",
            dashboard: dashboardRef,
            user: idRef("user-1"),
            tabLocalIdentifier: selectActiveTabLocalIdentifier(Tester.state()),
            filterContext: selectFilterContextDefinition(Tester.state()),
        };
        Tester.dispatch(filterViewsActions.addFilterView({ dashboard: dashboardRef, filterView }));

        await Tester.dispatchAndWaitFor(
            applyFilterView(filterView.ref),
            "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
        );

        expect(selectIsWorkingParametersChanged(Tester.state())).toBe(false);
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
    });

    it("emits a parameters changed event when a filter view carrying a different value is applied", async () => {
        await stageFilterAndParameter();

        const dashboardRef = selectDashboardRef(Tester.state())!;
        const activeTabId = selectActiveTabLocalIdentifier(Tester.state());
        const filterView: IDashboardFilterView = {
            ref: idRef("filter-view-1", "filterView"),
            name: "View",
            dashboard: dashboardRef,
            user: idRef("user-1"),
            tabLocalIdentifier: activeTabId,
            filterContext: selectFilterContextDefinition(Tester.state()),
            parameters: [{ ...topNParameter, value: 7 }],
        };
        Tester.dispatch(filterViewsActions.addFilterView({ dashboard: dashboardRef, filterView }));

        await Tester.dispatchAndWaitFor(
            applyFilterView(filterView.ref),
            "GDC.DASH/EVT.FILTER_CONTEXT.FILTER_VIEW.APPLY.SUCCESS",
        );

        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(7);
        const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
        expect(events).toHaveLength(1);
        expect(events[0].payload).toEqual({
            parameters: [{ ref: topNRef, value: 7 }],
            tabLocalIdentifier: activeTabId,
        });
    });

    it("emits a parameters changed event with the applied values when a staged parameter is applied", async () => {
        await stageFilterAndParameter();
        const activeTabId = selectActiveTabLocalIdentifier(Tester.state());

        await Tester.dispatchAndWaitFor(
            applyFilterContextWorkingSelection(),
            "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED",
        );

        const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
        expect(events).toHaveLength(1);
        expect(events[0].payload).toEqual({
            parameters: [{ ref: topNRef, value: 42 }],
            tabLocalIdentifier: activeTabId,
        });
    });

    it("does not emit a parameters changed event when only a gated string value is applied", async function gatedStringApply() {
        const ref = idRef("scenario", "parameter");
        Tester.dispatch(
            tabsActions.addParameter({
                parameter: { ref, parameterType: "STRING", mode: "active" },
                workspaceDefault: "Actual",
            }),
        );
        Tester.dispatch(tabsActions.setParameterWorkingValue({ ref, value: "Forecast" }));
        const config = selectConfig(Tester.state());
        Tester.dispatch(
            configActions.setConfig({
                ...config,
                settings: { ...config.settings, enableStringParameters: false },
            }),
        );
        const valuesBefore = selectParameterValuesByTab(Tester.state());

        await Tester.dispatchAndWaitFor(
            applyFilterContextWorkingSelection(),
            "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED",
        );

        expect(selectParameterRuntimeOverrideByRef(ref)(Tester.state())).toBe("Forecast");
        expect(selectParameterValuesByTab(Tester.state())).toEqual(valuesBefore);
        expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
    });

    it("does not emit a parameters changed event when only a filter is staged", async () => {
        await Tester.dispatchAndWaitFor(
            changeWorkingAttributeFilterSelection(
                firstAttributeFilterLocalId(),
                { uris: [STAGED_ELEMENT_URI] },
                "IN",
            ),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        await Tester.dispatchAndWaitFor(
            applyFilterContextWorkingSelection(),
            "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED",
        );

        expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
    });
});
