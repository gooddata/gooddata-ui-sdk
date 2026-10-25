// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { initialState } from "../../reducers/initial_state.js";
import { rootReducer } from "../../reducers/root_reducer.js";
import { redoPossible, undoPossible } from "../../selectors/editor_header_selector.js";
import { withData, withReport, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IDateDataset } from "../../typings/datasets.js";
import { captureSnapshot, selectTimeTravel } from "../_infra/time_travel.js";
import { timeTravelInitialState } from "../_infra/time_travel_state.js";
import {
    buildApplicationResetCarrier,
    wholeApplicationReset,
} from "../app_context/application_reset_events.js";
import { dateDatasetsInitialState } from "../date_datasets/date_datasets_state.js";
import { type IAppState } from "../types.js";
import { getVisualizationClassesState } from "../visualization_classes/visualization_classes_selectors.js";

import { locationRedirectLock, routeChanged, setRouteProjectId } from "./router_actions.js";
import { buildNextRoute, shouldResetOnNavigation } from "./router_helpers.js";
import {
    getPreviousRouteProjectId,
    getRouteProjectId,
    getRouteQueryDataset,
    getRouteQueryExclude,
    getRouteQueryInclude,
    getRouteReportId,
    getRouteState,
} from "./router_selectors.js";
import { type IRouteState } from "./router_state.js";

/**
 * THE ROUTER PINS. The LOCATION_CHANGED flow is trigger → router saga → `routeChanged` (+
 * conditional `wholeApplicationReset`), so `navigate` below replicates the worker's exact
 * synchronous prefix — the SAME helpers, the SAME events, the SAME dispatch order
 * (sagas/router_sagas.ts#locationChanged) — against the real root reducer. The saga itself is pinned
 * in sagas/test/router_sagas.test.ts.
 */
function navigate(state: IAppState, hash: string): IAppState {
    const previousRoute = getRouteState(state);
    const route = buildNextRoute(hash, previousRoute);

    let next = rootReducer(state, routeChanged(route, previousRoute));
    if (shouldResetOnNavigation(route, previousRoute)) {
        next = rootReducer(
            next,
            wholeApplicationReset({
                reset: buildApplicationResetCarrier(getVisualizationClassesState(next)),
            }),
        );
    }
    return next;
}

describe("the router domain", () => {
    describe("locationRedirectLock", () => {
        it("should be possible to turn it on", () => {
            const changedState = rootReducer(initialState, locationRedirectLock(true));

            expect(changedState.appState.locationRedirectLock).toBe(true);
        });

        it("should be possible to turn it off", () => {
            const changedState = rootReducer(initialState, locationRedirectLock(false));

            expect(changedState.appState.locationRedirectLock).toBe(false);
        });
    });

    describe("locationChanged", () => {
        it("should store current route to state on location change", () => {
            // the hash carries no workspace prefix: the host sets the project id once at mount
            const mountedState = rootReducer(initialState, setRouteProjectId("proj"));

            const changedState = navigate(
                mountedState,
                "#/?dataset=d&includeObjectsWithTags=[i]&excludeObjectsWithTags=[e]",
            );

            expect(getRouteProjectId(changedState)).toEqual("proj");
            expect(getRouteQueryDataset(changedState)).toEqual("d");
            expect(getRouteQueryInclude(changedState)).toEqual("[i]");
            expect(getRouteQueryExclude(changedState)).toEqual("[e]");
        });

        it("should backup previous route on location change", () => {
            const route = {
                params: {
                    projectId: "proj",
                    reportId: "report1",
                    query: {
                        dataset: "d",
                        includeObjectsWithTags: "i",
                    },
                },
            };

            const state = withRoot(initialState, { route: route });
            const changedState = navigate(
                state,
                "#/?dataset=e&includeObjectsWithTags=[i2]&excludeObjectsWithTags=[e2]",
            );

            expect(changedState.previousRoute).toEqual(route);
        });

        it("should reset whole app on location change when report ID changed to default", () => {
            const route = {
                params: {
                    projectId: "proj",
                    query: {
                        dataset: "d",
                        includeObjectsWithTags: ["i1"],
                    },
                    reportId: "123",
                },
            };
            const state = withRoot(withReport(initialState, { nowOpen: true }), {
                route: route as unknown as IRouteState,
            });

            const changedState = navigate(state, "#/reportId/edit?dataset=d&includeObjectsWithTags=i2");

            expect(changedState.report.nowOpen).toBe(false);
        });

        it("should preserve the host-owned workspace across location changes", () => {
            const mountedState = rootReducer(initialState, setRouteProjectId("hostWorkspace"));

            // the hash carries no workspace prefix — the first segment is the reportId
            const changedState = navigate(mountedState, "#/report1/edit");

            expect(getRouteProjectId(changedState)).toEqual("hostWorkspace");
            expect(getRouteReportId(changedState)).toEqual("report1");
        });
    });

    describe("setRouteProjectId", () => {
        it("should store the project id into both current and previous route", () => {
            const changedState = rootReducer(initialState, setRouteProjectId("hostWorkspace"));

            expect(getRouteProjectId(changedState)).toEqual("hostWorkspace");
            expect(getPreviousRouteProjectId(changedState)).toEqual("hostWorkspace");
        });

        it("should not materialize a reportId (the first navigation's reset check relies on it)", () => {
            const changedState = rootReducer(initialState, setRouteProjectId("hostWorkspace"));

            expect(getRouteReportId(changedState)).toBeUndefined();
        });
    });

    // the first navigation has no previous route and lands on the default report, so it resets
    // the whole application (store/router/router_helpers.ts#shouldResetOnNavigation)
    describe("whole-application reset on navigation", () => {
        it("should clear the undo history on the reset transition", () => {
            // the history is CLEARED, not just disabled: leaving the
            // module-level stacks populated — the stacks are the state now, so they are cleared
            const state: IAppState = {
                ...initialState,
                timeTravel: {
                    past: [{ state: captureSnapshot(initialState), actionType: "EDIT" }],
                    future: [{ state: captureSnapshot(initialState), actionType: "EDIT" }],
                },
            };

            const changedState = navigate(state, "#/");

            expect(selectTimeTravel(changedState)).toEqual(timeTravelInitialState);
            expect(undoPossible(changedState)).toEqual(false);
            expect(redoPossible(changedState)).toEqual(false);
        });

        it("should reset date datasets on the reset transition", () => {
            const state = withData(initialState, {
                dateDatasets: {
                    ...initialState.data.dateDatasets,
                    available: ["foo", "bar"] as unknown as IDateDataset[],
                },
            });

            const changedState = navigate(state, "#/");

            // the subtree is slice-owned, so the reset writes the domain's default
            // (initialState carries no seed for it any more)
            expect(changedState.data.dateDatasets).toEqual(dateDatasetsInitialState);
        });
    });
});
