// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IHeaderPredicate } from "@gooddata/sdk-ui";

import { conversionDone } from "../../actions/drillable_items_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";

import { getDrillableItems } from "./drillable_items_selectors.js";

// pins the slice behavior
describe("drillableItems store", () => {
    const predicate = (() => true) as unknown as IHeaderPredicate;

    it("should self-initialize to an empty array", () => {
        const updated = combinedRootReducer(initialState, { type: "@@ANY" });

        expect(updated?.appState?.meta?.drillableItems).toEqual([]);
        expect(getDrillableItems(updated)).toEqual([]);
    });

    it("should store the converted predicates as a plain array", () => {
        const updated = combinedRootReducer(initialState, conversionDone([predicate]));

        const stored = getDrillableItems(updated);
        expect(Array.isArray(stored)).toBe(true);
        expect(stored).toEqual([predicate]);
    });

    it("should replace previous predicates wholesale", () => {
        const other = (() => false) as unknown as IHeaderPredicate;
        let state = combinedRootReducer(initialState, conversionDone([predicate]));
        state = combinedRootReducer(state, conversionDone([other]));

        expect(getDrillableItems(state)).toEqual([other]);
    });

    it("should not touch the sibling appState.meta keys", () => {
        // the flags are seeded by the embedding mini-slices, so start from the
        // initialized chain state instead of the raw literal
        const updated = combinedRootReducer(getInitializedState(), conversionDone([predicate]));

        expect(updated?.appState?.meta?.isEmbedded).toBe(false);
    });
});
