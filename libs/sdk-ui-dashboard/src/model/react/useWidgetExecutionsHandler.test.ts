// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    idRef,
    insightRef,
    insightSetProperties,
    isDashboardAttributeFilter,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { ProtectedReportSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

// a type-only import, so it does not load the module before the mock below is in place
import { type DashboardTester } from "../DashboardTester.js";

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` call into a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

const store = vi.hoisted(() => ({ tester: undefined as unknown as DashboardTester }));

// the hook reads and writes a real dashboard store; a render reads the state as it is at that moment
vi.mock("./DashboardStoreProvider.js", () => ({
    useDashboardDispatch: () => (action: PayloadAction) => store.tester.dispatch(action),
    useDashboardSelector: (selector: (state: unknown) => unknown) => selector(store.tester.state()),
}));

const { SimpleDashboardFilterContext, SimpleDashboardIdentifier, SimpleSortedTableWidgetRef } =
    await import("../../tests/SimpleDashboard.test.helpers.js");
const { PivotTableWithRowAndColumnAttributes } = await import("../tests/Insights.test.helpers.js");
const { changeAttributeFilterSelection, changeDateFilterSelection } = await import("../commands/filters.js");
const { setDashboardAttributeFilterConfigDisplayAsLabel } = await import("../commands/dashboard.js");
const { setExecutionResultData, setExecutionResultLoading } = await import("../commands/executionResults.js");
const {
    changeInsightWidgetInsight,
    ignoreFilterOnInsightWidget,
    refreshInsightWidget,
    unignoreFilterOnInsightWidget,
} = await import("../commands/insight.js");
const { insightsActions } = await import("../store/insights/index.js");
const { selectInsightByWidgetRef } = await import("../store/insights/insightsSelectors.js");
const { preloadedTesterFactory } = await import("../DashboardTester.js");
const { selectWidgetsWithRestrictedData } =
    await import("../store/restrictedData/restrictedDataSelectors.js");
const { tabsActions } = await import("../store/tabs/index.js");
const { selectAnalyticalWidgetByRef } = await import("../store/tabs/layout/layoutSelectors.js");
const { useWidgetExecutionsHandler } = await import("./useWidgetExecutionsHandler.js");

const WIDGET = SimpleSortedTableWidgetRef;
const DEPARTMENT_DISPLAY_FORM = idRef("f_owner.department_id", "displayForm");
const DEPARTMENT_HYPERLINK_DISPLAY_FORM = idRef("f_owner.department_id.departmenthyperlink", "displayForm");

describe("useWidgetExecutionsHandler", () => {
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            store.tester = tester;
        }, SimpleDashboardIdentifier);
    });

    function renderHandler() {
        return renderHook(() => useWidgetExecutionsHandler(WIDGET));
    }

    function isRestricted() {
        return selectWidgetsWithRestrictedData(store.tester.state()).has(serializeObjRef(WIDGET));
    }

    function executionResultUpserts() {
        return store.tester
            .dispatchedActions()
            .filter((action) => action.type === "executionResults/upsertExecutionResult").length;
    }

    function departmentFilterLocalIdentifier(): string {
        return SimpleDashboardFilterContext.filters
            .filter(isDashboardAttributeFilter)
            .find((filter) => areObjRefsEqual(filter.attributeFilter.displayForm, DEPARTMENT_DISPLAY_FORM))!
            .attributeFilter.localIdentifier!;
    }

    async function applyLastMonths(months: number) {
        store.tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -months, 0));
        await store.tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");
    }

    it("should record a refusal with the inputs of the refused execution, not the ones applied when it arrives", async () => {
        await applyLastMonths(3);
        const { result, rerender } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });

        // the filters change before the refusal of the running execution arrives
        await applyLastMonths(6);
        rerender();
        result.current.onError(new ProtectedReportSdkError());

        expect(isRestricted()).toBe(false);

        await applyLastMonths(3);

        expect(isRestricted()).toBe(true);
    });

    it("should not restrict an execution that starts while the previous refusal is still queued", async () => {
        await applyLastMonths(3);
        const { result, rerender } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());
        expect(isRestricted()).toBe(true);

        // starts before the command queue processes the error of the previous execution
        await applyLastMonths(6);
        rerender();
        result.current.onLoadingChanged({ isLoading: true });
        expect(isRestricted()).toBe(false);

        // loading, refusal and loading again
        await vi.waitFor(() => expect(executionResultUpserts()).toBe(3));
        expect(isRestricted()).toBe(false);
    });

    it("should end a refusal once the widget executes successfully with other inputs", async () => {
        await applyLastMonths(3);
        const { result, rerender } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        await applyLastMonths(6);
        rerender();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onSuccess({} as IExecutionResult, undefined, undefined);
        await applyLastMonths(3);

        expect(isRestricted()).toBe(false);
    });

    it("should end a refusal once the widget fails for another reason", async () => {
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());
        expect(isRestricted()).toBe(true);

        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new UnexpectedSdkError());

        expect(isRestricted()).toBe(false);
    });

    it("should keep a refused widget restricted when a filter it ignores changes", async () => {
        const departmentFilterLocalId = departmentFilterLocalIdentifier();
        await store.tester.dispatchAndWaitFor(
            ignoreFilterOnInsightWidget(WIDGET, DEPARTMENT_DISPLAY_FORM),
            "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        );
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        await store.tester.dispatchAndWaitFor(
            changeAttributeFilterSelection(departmentFilterLocalId, { uris: ["department-1"] }, "IN"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );
        expect(isRestricted()).toBe(true);

        await store.tester.dispatchAndWaitFor(
            unignoreFilterOnInsightWidget(WIDGET, DEPARTMENT_DISPLAY_FORM),
            "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        );
        expect(isRestricted()).toBe(false);
    });

    it("should keep a refused widget restricted when a filter it ignores by its display-as label changes", async () => {
        const departmentFilterLocalId = departmentFilterLocalIdentifier();
        await store.tester.dispatchAndWaitFor(
            setDashboardAttributeFilterConfigDisplayAsLabel(
                departmentFilterLocalId,
                DEPARTMENT_HYPERLINK_DISPLAY_FORM,
            ),
            "GDC.DASH/EVT.ATTRIBUTE_FILTER_CONFIG.DISPLAY_AS_LABEL_CHANGED",
        );
        // as stored on a loaded dashboard; the ignore command itself records the primary display form
        const ignoreByLabel = ignoreFilterOnInsightWidget(WIDGET, DEPARTMENT_HYPERLINK_DISPLAY_FORM);
        store.tester.dispatch(
            tabsActions.replaceWidgetFilterSettings({
                ref: WIDGET,
                dateDataSet: selectAnalyticalWidgetByRef(WIDGET)(store.tester.state())?.dateDataSet,
                ignoreDashboardFilters: [
                    { type: "attributeFilterReference", displayForm: DEPARTMENT_HYPERLINK_DISPLAY_FORM },
                ],
                undo: { cmd: ignoreByLabel },
            }),
        );
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        await store.tester.dispatchAndWaitFor(
            changeAttributeFilterSelection(departmentFilterLocalId, { uris: ["department-1"] }, "IN"),
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );

        expect(isRestricted()).toBe(true);
    });

    it("should release a refused widget when its visualization is replaced", async () => {
        const otherInsightRef = insightRef(PivotTableWithRowAndColumnAttributes);
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        await store.tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(WIDGET, otherInsightRef),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );

        expect(isRestricted()).toBe(false);
    });

    it("should release a refused widget when its insight is updated under the same ref", () => {
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        const insight = selectInsightByWidgetRef(WIDGET)(store.tester.state())!;
        store.tester.dispatch(
            insightsActions.upsertInsight(
                insightSetProperties(insight, { controls: { legend: { enabled: false } } }),
            ),
        );

        expect(isRestricted()).toBe(false);
    });

    it("should release a refused widget when it is refreshed", async () => {
        // an insight the recorded backend can load again
        await store.tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(WIDGET, insightRef(PivotTableWithRowAndColumnAttributes)),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        // the insight is unchanged, so only the refresh itself can let the widget execute again
        await store.tester.dispatchAndWaitFor(
            refreshInsightWidget(WIDGET),
            "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED",
        );

        expect(isRestricted()).toBe(false);
    });

    it("should keep the same restricted widgets until they change", async () => {
        await applyLastMonths(3);
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());
        const restricted = selectWidgetsWithRestrictedData(store.tester.state());

        store.tester.dispatch(setExecutionResultLoading("widget-other"));
        store.tester.dispatch(
            setExecutionResultData("widget-other", {} as IExecutionResult, undefined, undefined),
        );
        // the widget's own loading and refusal, then the other widget's loading and data
        await vi.waitFor(() => expect(executionResultUpserts()).toBe(4));
        expect(selectWidgetsWithRestrictedData(store.tester.state())).toBe(restricted);

        // ignoring a filter changes the widget's inputs, which releases it
        await store.tester.dispatchAndWaitFor(
            ignoreFilterOnInsightWidget(WIDGET, DEPARTMENT_DISPLAY_FORM),
            "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        );
        expect(selectWidgetsWithRestrictedData(store.tester.state()).size).toBe(0);
    });

    it("should keep a refused widget restricted while it executes again", async () => {
        const { result } = renderHandler();
        result.current.onLoadingChanged({ isLoading: true });
        result.current.onError(new ProtectedReportSdkError());

        result.current.onLoadingChanged({ isLoading: true });

        expect(isRestricted()).toBe(true);
    });
});
