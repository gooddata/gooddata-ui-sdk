// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    storeConfigurationPanelCollapsed,
    storeConfigurationPanelCollapsedByDragging,
} from "../../actions/buckets_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";

import {
    getConfigurationPanelState,
    isConfigurationPanelCollapsed,
    isConfigurationPanelCollapsedByDragging,
} from "./configuration_panel_selectors.js";
import { configurationPanelInitialState } from "./configuration_panel_state.js";

describe("configurationPanel store", () => {
    it("self-initializes to collapsed, with the dragging flag unset", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getConfigurationPanelState(state)).toEqual({ collapsed: true });
        expect(isConfigurationPanelCollapsed(state)).toBe(true);
        expect(isConfigurationPanelCollapsedByDragging(state)).toBe(false);
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getConfigurationPanelState(initialState)).toBe(configurationPanelInitialState);
    });

    it("STORE/CONFIGURATION_PANEL_COLLAPSED stores the flag both ways", () => {
        const expanded = combinedRootReducer(getInitializedState(), storeConfigurationPanelCollapsed(false));
        expect(isConfigurationPanelCollapsed(expanded)).toBe(false);

        const collapsed = combinedRootReducer(expanded, storeConfigurationPanelCollapsed(true));
        expect(isConfigurationPanelCollapsed(collapsed)).toBe(true);
    });

    it("STORE/CONFIGURATION_PANEL_COLLAPSED_BY_DRAGGING stores the flag without touching collapsed", () => {
        const state = combinedRootReducer(
            combinedRootReducer(getInitializedState(), storeConfigurationPanelCollapsed(false)),
            storeConfigurationPanelCollapsedByDragging(true),
        );

        expect(isConfigurationPanelCollapsedByDragging(state)).toBe(true);
        expect(isConfigurationPanelCollapsed(state)).toBe(false);
    });

    it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
        const state = getInitializedState();

        expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
    });

    // open_report_reducer / app_context_transformer re-collapse the panel with setIn, and
    // buckets_reducer deletes the dragging flag when a dragged item lands in a bucket. Both write
    // on actions the slice does not handle.
    describe("coexistence with the remaining external writers", () => {
        it("reduces on top of a collapsed flag written straight into the subtree", () => {
            const external = withData(getInitializedState(), {
                configurationPanel: { ...getInitializedState().data.configurationPanel, collapsed: true },
            });

            const state = combinedRootReducer(external, storeConfigurationPanelCollapsedByDragging(true));

            expect(isConfigurationPanelCollapsed(state)).toBe(true);
            expect(isConfigurationPanelCollapsedByDragging(state)).toBe(true);
        });

        it("reads a deleted dragging flag as false again", () => {
            const dragging = combinedRootReducer(
                getInitializedState(),
                storeConfigurationPanelCollapsedByDragging(true),
            );

            // the marker KEY is dropped, not set to false — the flag is deliberately unseeded and
            // both readers coerce with `|| false`
            const { collapsedByDragging: _dropped, ...configurationPanel } = dragging.data.configurationPanel;
            const dropped = withData(dragging, { configurationPanel });

            expect(isConfigurationPanelCollapsedByDragging(dropped)).toBe(false);
        });

        // a PARTIAL subtree: the mount and the selector fill in the keys the seed omits
        it("completes a partially seeded subtree through the mount and the selector", () => {
            const partialSubtree = withData(initialState, { configurationPanel: { collapsed: false } });

            const state = combinedRootReducer(
                partialSubtree,
                storeConfigurationPanelCollapsedByDragging(true),
            );

            expect(getConfigurationPanelState(state)).toEqual({
                collapsed: false,
                collapsedByDragging: true,
            });
        });
    });
});
