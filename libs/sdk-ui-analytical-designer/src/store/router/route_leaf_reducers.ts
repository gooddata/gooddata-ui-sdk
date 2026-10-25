// (C) 2026 GoodData Corporation

import { type Action } from "redux";

import { routeChanged, setRouteProjectId } from "./router_actions.js";
import { withRouteProjectId } from "./router_helpers.js";
import { type IRouteState } from "./router_state.js";

/**
 * THE TWO ROUTE LEAVES of the combined root. The `routeChanged` event carries BOTH values (the
 * router saga reads the pre-navigation route before dispatching), so each key has a boring
 * reducer of its own — no cross-key read — and the pair still lands atomically in one dispatch.
 *
 * SET_ROUTE_PROJECT_ID writes the same projectId into both leaves independently — the payload is
 * all either side needs, so it stays a plain case on the trigger (no saga, no event).
 *
 * Hand-written rather than `createSlice` because both values mean "no navigation yet" as
 * `undefined`, and the absence is load-bearing (router_state.ts). The combined root mounts them
 * through `nullableLeaf`, which stores that as `null` and hands `undefined` back in; the input
 * selectors convert the stored `null` back to `undefined`.
 */

export function routeLeafReducer(state: IRouteState | undefined, action: Action): IRouteState | undefined {
    if (routeChanged.match(action)) {
        return action.payload.route;
    }
    if (setRouteProjectId.match(action)) {
        return withRouteProjectId(state, action.payload.projectId);
    }
    return state;
}

export function previousRouteLeafReducer(
    state: IRouteState | undefined,
    action: Action,
): IRouteState | undefined {
    if (routeChanged.match(action)) {
        return action.payload.previousRoute;
    }
    if (setRouteProjectId.match(action)) {
        return withRouteProjectId(state, action.payload.projectId);
    }
    return state;
}
