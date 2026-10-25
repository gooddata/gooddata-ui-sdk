// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { rootReducer } from "../../reducers/root_reducer.js";
import { getFilterBarAutoOpenFilter } from "../../selectors/filter_bar_auto_open_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { insightContentCleared } from "../app_context/application_reset_events.js";
import { removeFiltersFromState, storeFilterBarAutoOpen } from "../filter_bar/filter_bar_actions.js";

/**
 * The filterBarAutoOpen slice. Pins the hand-over round-trip AND the null-normalization boundary:
 * the slice stores null for "nothing pending" and the selector answers undefined.
 */
describe("filterBarAutoOpen store", () => {
    it("self-initializes to null and the selector answers undefined", () => {
        const state = getInitializedState();

        expect(state.filterBarAutoOpen).toBe(null);
        expect(getFilterBarAutoOpenFilter(state)).toBeUndefined();
    });

    it("stores the filter to open and clears it on a null hand-over", () => {
        const pending = rootReducer(getInitializedState(), storeFilterBarAutoOpen("filter1"));
        expect(getFilterBarAutoOpenFilter(pending)).toBe("filter1");

        const cleared = rootReducer(pending, storeFilterBarAutoOpen(null));
        expect(cleared.filterBarAutoOpen).toBe(null);
        expect(getFilterBarAutoOpenFilter(cleared)).toBeUndefined();
    });

    it("drops a pending hand-over when its filter is removed, and keeps it for another filter", () => {
        const pending = rootReducer(getInitializedState(), storeFilterBarAutoOpen("filter1"));

        expect(rootReducer(pending, removeFiltersFromState(["other"], false)).filterBarAutoOpen).toBe(
            "filter1",
        );
        expect(rootReducer(pending, removeFiltersFromState(["filter1"], false)).filterBarAutoOpen).toBe(null);
    });

    it("drops a pending hand-over when the insight content is cleared", () => {
        const pending = rootReducer(getInitializedState(), storeFilterBarAutoOpen("filter1"));

        const cleared = rootReducer(pending, insightContentCleared({ reset: { sessionId: "fresh" } }));

        expect(cleared.filterBarAutoOpen).toBe(null);
    });
});
