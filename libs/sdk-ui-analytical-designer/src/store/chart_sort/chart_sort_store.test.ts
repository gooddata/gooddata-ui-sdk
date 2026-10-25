// (C) 2022-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { openReportFinished } from "../../actions/open_actions.js";
import { areaSortAsc1, attributeSortConfig } from "../../tests/chart_sort.test.helpers.js";
import { applicationCleared } from "../app_context/application_reset_events.js";

import { storeAppliedChartSort, storeChartSortConfig } from "./chart_sort_actions.js";
import { chartSortReducer } from "./chart_sort_reducer.js";
import { type IChartSortState, defaultChartSortState } from "./chart_sort_state.js";

const openReportFinishedAction = () =>
    openReportFinished(
        { insight: {} } as Parameters<typeof openReportFinished>[0],
        {} as Parameters<typeof openReportFinished>[1],
        0,
        false,
        {} as Parameters<typeof openReportFinished>[4],
    );

describe("Chart Sort store", () => {
    it("should store chart sort", () => {
        const action = storeChartSortConfig(attributeSortConfig);
        const reducedState = chartSortReducer(undefined, action);
        expect(reducedState).toMatchSnapshot();
    });

    it("should store current chart sort", () => {
        const action = storeAppliedChartSort(attributeSortConfig.defaultSort);
        const reducedState = chartSortReducer(undefined, action);
        expect(reducedState).toMatchSnapshot();
    });

    it("should reset chart store on application reset", () => {
        const state: IChartSortState = {
            appliedSort: [areaSortAsc1],
            sortConfig: attributeSortConfig,
        };
        // the reset is a semantic EVENT — the RESET_APPLICATION trigger writes
        // nothing (store/app_context/application_reset_events.ts)
        const action = applicationCleared({
            reset: { sessionId: "fresh", defaultVisualizationClass: null },
        });
        const reducedState = chartSortReducer(state, action);
        expect(reducedState).toMatchSnapshot();
    });

    /**
     * Insight-to-insight navigation performs NO application reset, so the previous insight's sort
     * configuration would otherwise leak into the freshly opened one — which leaves
     * `canApplyCustomSort` stale-TRUE and makes the untouched insight report unsaved changes.
     */
    it("should reset the sort configuration when a report open finishes", () => {
        const state: IChartSortState = {
            appliedSort: [areaSortAsc1],
            sortConfig: attributeSortConfig,
        };

        const reducedState = chartSortReducer(state, openReportFinishedAction());

        expect(reducedState.sortConfig).toEqual(defaultChartSortState.sortConfig);
    });

    /** The open saga stores the opened insight's own sort BEFORE the finish, so it must survive. */
    it("should keep the applied sort the open saga stored when a report open finishes", () => {
        const state: IChartSortState = {
            appliedSort: [areaSortAsc1],
            sortConfig: attributeSortConfig,
        };

        const reducedState = chartSortReducer(state, openReportFinishedAction());

        expect(reducedState.appliedSort).toEqual([areaSortAsc1]);
    });

    it("should keep the identity of an already pristine configuration when a report open finishes", () => {
        const reducedState = chartSortReducer(defaultChartSortState, openReportFinishedAction());

        expect(reducedState).toBe(defaultChartSortState);
    });
});
