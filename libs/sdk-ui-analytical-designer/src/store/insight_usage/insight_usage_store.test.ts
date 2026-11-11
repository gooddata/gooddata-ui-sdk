// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { resetInsightUsageOnDashboards, updateInsightUsageOnDashboards } from "../../actions/data_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { createAnalyticalDashboard, createListedDashboard } from "../../tests/constants.test.helpers.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { EMPTY_INSIGHT_USAGE_ON_DASHBOARDS } from "./insight_usage_helpers.js";
import {
    getInsightUsageInDocumentsSelector,
    getInsightUsageOnDashboardsSelector,
    getInsightUsageState,
} from "./insight_usage_selectors.js";
import { insightUsageInitialState } from "./insight_usage_state.js";

const REFERENCED = [createAnalyticalDashboard("Sale", "Bee", 123)];
const USER_DASHBOARDS = [createListedDashboard("Sale", "Bee", 123)];

describe("insightUsage store", () => {
    it("self-initializes to null on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getInsightUsageState(state)).toBeNull();
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getInsightUsageState(initialState)).toBe(insightUsageInitialState);
    });

    it("stores the raw referenced/user dashboard pair", () => {
        const state = combinedRootReducer(
            getInitializedState(),
            updateInsightUsageOnDashboards(REFERENCED, USER_DASHBOARDS),
        );

        expect(getInsightUsageState(state)).toEqual({
            referencedDashboards: REFERENCED,
            allUserDashboards: USER_DASHBOARDS,
            referencedDocuments: [],
        });
    });

    it("serves the referencing documents sorted by title", () => {
        const state = combinedRootReducer(
            getInitializedState(),
            updateInsightUsageOnDashboards(REFERENCED, USER_DASHBOARDS, [
                createAnalyticalDashboard("zeta report", "doc2", 2),
                createAnalyticalDashboard("Alpha report", "doc1", 1),
            ]),
        );

        expect(getInsightUsageInDocumentsSelector(state)).toEqual([
            { id: "doc1", title: "Alpha report" },
            { id: "doc2", title: "zeta report" },
        ]);
    });

    it("resets to null, which the derived selector reads as the empty usage", () => {
        const stored = combinedRootReducer(
            getInitializedState(),
            updateInsightUsageOnDashboards(REFERENCED, USER_DASHBOARDS),
        );
        expect(getInsightUsageOnDashboardsSelector(stored).allDashboardsCount).toBe(1);

        const reset = combinedRootReducer(stored, resetInsightUsageOnDashboards());

        expect(getInsightUsageState(reset)).toBeNull();
        expect(getInsightUsageOnDashboardsSelector(reset)).toEqual(EMPTY_INSIGHT_USAGE_ON_DASHBOARDS);
    });

    it("serves the empty usage before anything was stored (absent subtree)", () => {
        expect(getInsightUsageOnDashboardsSelector(getInitializedState())).toEqual(
            EMPTY_INSIGHT_USAGE_ON_DASHBOARDS,
        );
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });
});
