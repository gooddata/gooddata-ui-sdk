// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { setEmbedded } from "../actions/embedded_actions.js";
import { setHostedComponentMode } from "../appMode/appMode.js";
import { initialState } from "../reducers/initial_state.js";
import { rootReducer } from "../reducers/root_reducer.js";
import { AVAILABLE_DISPLAYED_ACTIONS, displayedActions } from "../selectors/editor_header_selector.js";
import { getSourceDashboardId, isEditFromKD, isExploreFromKD } from "../selectors/route_selector.js";
import { routeChanged } from "../store/router/router_actions.js";
import { buildNextRoute } from "../store/router/router_helpers.js";
import { getRouteState } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";

import { type IAdEmbeddedRouteConfig, buildEmbeddedHash } from "./buildEmbeddedHash.js";

/**
 * The route config an in-process embedded AD is mounted with has to decode into the same flow flags
 * the iframe URL produced, because those flags — not the config — drive the header. This drives the
 * real mount sequence of AnalyticalDesignerEmbedded (pluggable + hosted + embedded, then the initial
 * location) through the root reducer chain, then reads the flow selectors.
 */
function mountEmbedded(config: IAdEmbeddedRouteConfig): IAppState {
    let state = initialState;
    state = rootReducer(state, setHostedComponentMode(true));
    state = rootReducer(state, setEmbedded(true));
    // the route write is the router saga's `routeChanged` event — this replicates
    // its exact computation (sagas/router_sagas.ts#locationChanged) in pluggable mode
    const previousRoute = getRouteState(state);
    const route = buildNextRoute(`/${buildEmbeddedHash(config)}`, previousRoute);
    return rootReducer(state, routeChanged(route, previousRoute));
}

/** The EditorHeader condition; its props-to-DOM half is covered by components/test/EditorHeader.test.tsx. */
function isCancelButtonVisible(state: IAppState): boolean {
    return (
        isEditFromKD(state) ||
        isExploreFromKD(state) ||
        displayedActions(state).includes(AVAILABLE_DISPLAYED_ACTIONS.CANCEL)
    );
}

const EDIT_FROM_DASHBOARD: IAdEmbeddedRouteConfig = {
    insightId: "insight-1",
    hideActions: ["open", "clear", "export"],
    allowDashboardLinks: true,
    isEmbeddedFromKD: true,
};

describe("embedded route flows", () => {
    it("should recognize the edit-from-dashboard flow", () => {
        const state = mountEmbedded({ ...EDIT_FROM_DASHBOARD, sourceDashboardId: "dash-1" });

        expect(getSourceDashboardId(state)).toBe("dash-1");
        expect(isEditFromKD(state)).toBe(true);
        expect(isCancelButtonVisible(state)).toBe(true);
    });

    it("should recognize the edit-from-dashboard flow on a dashboard that has no identifier yet", () => {
        // A dashboard that has never been saved: the flow is active, the id is unknown. It must
        // stay active, or the KD insight overlay loses its Cancel button.
        const state = mountEmbedded({ ...EDIT_FROM_DASHBOARD, sourceDashboardId: "" });

        expect(getSourceDashboardId(state)).toBe("");
        expect(isEditFromKD(state)).toBe(true);
        expect(isCancelButtonVisible(state)).toBe(true);
    });

    it("should recognize the explore (draft copy) flow", () => {
        const state = mountEmbedded({
            sourceInsightId: "insight-2",
            hideActions: ["saveAs"],
            isEmbeddedFromKD: true,
        });

        expect(isEditFromKD(state)).toBe(false);
        expect(isExploreFromKD(state)).toBe(true);
        expect(isCancelButtonVisible(state)).toBe(true);
    });

    it("should carry the Cancel action of the new-insight flow, which has no source dashboard", () => {
        const state = mountEmbedded({
            hideActions: ["open", "export", "saveAs"],
            displayActions: ["cancel"],
            isEmbeddedFromKD: true,
        });

        expect(getSourceDashboardId(state)).toBeUndefined();
        expect(isEditFromKD(state)).toBe(false);
        expect(displayedActions(state)).toEqual(["cancel"]);
        expect(isCancelButtonVisible(state)).toBe(true);
    });
});
