// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    storeConfigurationPanelCollapsed,
    storeConfigurationPanelCollapsedByDragging,
} from "../../actions/buckets_actions.js";
import { METRIC } from "../../constants/bucket.js";
// the configuration panel is a slice — seed the state through its own mount
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import {
    isConfigurationPanelCollapsed,
    isConfigurationPanelCollapsedByDragging,
} from "../../store/configuration_panel/configuration_panel_selectors.js";
import { getDraggedCatalogItem } from "../../store/drag_and_drop/dnd_selectors.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { dispatchAction } from "../../utils/dispatch_action.js";
import { dragItemFailed, startDragCatalogItem } from "../drag_and_drop/drag_and_drop_actions.js";

describe("Config panel saga", () => {
    const draggedCatalogItem: ICatalogEntry = { type: METRIC };

    describe("UI_DND_CATALOG_ITEM_DRAG_BEGIN", () => {
        const testedAction = startDragCatalogItem(draggedCatalogItem);

        it("should collapse measure panel if it is opened", async () => {
            const collapseMeasurePanelAction = storeConfigurationPanelCollapsed(false);
            const state = combinedRootReducer(getInitializedState(), collapseMeasurePanelAction);

            const reducedState = await dispatchAction(state, testedAction);

            expect(isConfigurationPanelCollapsed(reducedState)).toBe(true);
            expect(isConfigurationPanelCollapsedByDragging(reducedState)).toBe(true);
        });

        it("should ignore measure panel if it is closed", async () => {
            const reducedState = await dispatchAction(getInitializedState(), testedAction);

            expect(getDraggedCatalogItem(reducedState)).toBe(draggedCatalogItem);
            expect(isConfigurationPanelCollapsed(reducedState)).toBe(true);
            expect(isConfigurationPanelCollapsedByDragging(reducedState)).toBe(false);
        });
    });

    describe("UI_DND_CATALOG_ITEM_DRAG_FAILED", () => {
        const testedAction = dragItemFailed(0, 0, "N/A", "N/A");

        it("should set measure panel as opened in app state if it was collapsed by dragging", async () => {
            const collapseByDraggingAction = storeConfigurationPanelCollapsedByDragging(true);
            const state = combinedRootReducer(getInitializedState(), collapseByDraggingAction);

            const reducedState = await dispatchAction(state, testedAction);

            expect(isConfigurationPanelCollapsed(reducedState)).toBe(false);
            expect(isConfigurationPanelCollapsedByDragging(reducedState)).toBe(false);
        });

        it("should change nothing in the app state when measure panel was not collapsed by dragging", async () => {
            const reducedState = await dispatchAction(getInitializedState(), testedAction);

            expect(isConfigurationPanelCollapsed(reducedState)).toBe(true);
            expect(isConfigurationPanelCollapsedByDragging(reducedState)).toBe(false);
        });
    });
});
