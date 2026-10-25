// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { refreshSessionId, setLocale } from "../actions/app_context_actions.js";
import { openReportStarted } from "../actions/open_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { shortcutSetDroppedItem } from "../actions/shortcuts_actions.js";
import { undo } from "../actions/time_travel_actions.js";
import { getDroppedCatalogItem } from "../selectors/shortcuts_selector.js";
import { getAppSessionId } from "../store/app_context/app_context_selectors.js";
import { getExtendedReferencePoint } from "../store/reference_point/reference_point_selectors.js";
import { routeChanged } from "../store/router/router_actions.js";
import { getPreviousRouteState, getRouteState } from "../store/router/router_selectors.js";
import { getPostponedAction } from "../store/shortcuts/postponed_action_selectors.js";
import { type IAppState } from "../store/types.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";

import { initialState } from "./initial_state.js";
import { rootReducer } from "./root_reducer.js";

/**
 * THE STRICT-COMPOSITION CONTRACT: the combined root is redux's strict `combineReducers`, so
 * one-owner-per-key, "no `undefined` values" and "unknown keys do not survive" are structural. This
 * suite pins them as observed behavior, plus the null-at-rest / undefined-at-the-boundary convention
 * of the `nullableLeaf` mounts.
 */

const UNRELATED_ACTION = { type: "NOBODY/HANDLES/THIS" };

/** Recursively asserts no key of a branch holds `undefined` (strict combineReducers rejects it). */
function expectNoUndefinedValues(branch: Record<string, unknown>, prefix: string): void {
    for (const [key, value] of Object.entries(branch)) {
        expect(value, `${prefix}${key}`).not.toBeUndefined();
    }
}

describe("strict root composition", () => {
    describe("no undefined at rest", () => {
        it("holds no undefined value at any root or branch key of the pristine build", () => {
            expectNoUndefinedValues(initialState as unknown as Record<string, unknown>, "");
            expectNoUndefinedValues(initialState.appState, "appState.");
            expectNoUndefinedValues(initialState.appState["meta"], "appState.meta.");
            expectNoUndefinedValues(initialState.data, "data.");
            expectNoUndefinedValues(initialState.data["shortcut"], "data.shortcut.");
            expectNoUndefinedValues(initialState.report, "report.");
        });

        it("keeps every key non-undefined after real work and an undo", () => {
            let state = rootReducer(
                getInitializedState(),
                routeChanged({ params: { projectId: "p1", reportId: "r1" } }, undefined),
            );
            state = rootReducer(state, reportTitleChange("edited"));
            state = rootReducer(state, undo());

            expectNoUndefinedValues(state as unknown as Record<string, unknown>, "");
            expectNoUndefinedValues(state.data, "data.");
        });
    });

    describe("identity short-circuit", () => {
        it("returns the SAME root object when no child changed", () => {
            const state = getInitializedState();

            expect(rootReducer(state, UNRELATED_ACTION)).toBe(state);
        });
    });

    describe("unknown keys are dropped", () => {
        // The conscious record of the strictness: a key nobody owns cannot ride along. Every key
        // written in production HAS an owning reducer; anything else is a bug the strict root
        // makes visible instead of preserving.
        it("drops a root key no reducer owns on the next real dispatch", () => {
            const withStray = { ...getInitializedState(), strayKey: "boo" } as IAppState;

            const next = rootReducer(withStray, setLocale("de-DE"));

            expect("strayKey" in next).toBe(false);
        });
    });

    describe("null at rest, undefined at the boundary", () => {
        it("reads the pristine optional leaves as undefined/null through their selectors", () => {
            expect(getRouteState(initialState)).toBeUndefined();
            expect(getPreviousRouteState(initialState)).toBeUndefined();
            expect(getAppSessionId(initialState)).toBeUndefined();
            expect(getExtendedReferencePoint(initialState)).toBeUndefined();
            expect(getPostponedAction(initialState)).toBeUndefined();
            expect(getDroppedCatalogItem(initialState)).toBeNull();
        });

        it("round-trips the route pair through the routeChanged event", () => {
            const firstRoute = { params: { projectId: "p1", reportId: "r1" } };
            const first = rootReducer(getInitializedState(), routeChanged(firstRoute, undefined));
            expect(getRouteState(first)?.params.projectId).toBe("p1");
            expect(getPreviousRouteState(first)).toBeUndefined();

            const second = rootReducer(
                first,
                routeChanged({ params: { projectId: "p1", reportId: "r2" } }, getRouteState(first)),
            );
            expect(getRouteState(second)?.params.reportId).toBe("r2");
            expect(getPreviousRouteState(second)?.params.reportId).toBe("r1");
        });

        it("stores a fresh session id and hands it out as a string", () => {
            const state = rootReducer(getInitializedState(), refreshSessionId());

            expect(typeof getAppSessionId(state)).toBe("string");
        });

        it("clears a seeded extended reference point back to null on OPEN_REPORT_STARTED", () => {
            const seeded = withData(getInitializedState(), { extendedReferencePoint: { buckets: [] } });

            const cleared = rootReducer(seeded, openReportStarted("p1", "r1"));

            expect(getExtendedReferencePoint(cleared)).toBeUndefined();
            expect(cleared.data["extendedReferencePoint"]).toBeNull();
        });

        it("parks and reads the dropped catalog item", () => {
            const catalogItem = { identifier: "aa.close_date", type: "metric", uri: "/gdc/md/1" };

            const parked = rootReducer(getInitializedState(), shortcutSetDroppedItem(catalogItem));

            expect(getDroppedCatalogItem(parked)).toBe(catalogItem);
        });
    });

    describe("undo over the null-at-rest leaves", () => {
        it("restores the route captured with the snapshot, never undefined", () => {
            const navigated = rootReducer(
                getInitializedState(),
                routeChanged({ params: { projectId: "p1", reportId: "r1" } }, undefined),
            );
            const edited = rootReducer(navigated, reportTitleChange("edited"));

            const undone = rootReducer(edited, undo());

            expect(getRouteState(undone)?.params.projectId).toBe("p1");
            expect(undone.route).not.toBeUndefined();
        });
    });
});
