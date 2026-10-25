// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { ActionTypeKeys } from "../../constants/actions.js";

import { type IRouteState } from "./router_state.js";

// in the global ActionTypeKeys enum (the time-travel whitelist matches on
// that enum). Prepare callbacks preserve the original positional call
// signatures AND payload shapes, so call sites and payload consumers are untouched.

export const locationChanged = createAction(ActionTypeKeys.LOCATION_CHANGED, (hash: string) => ({
    payload: { hash },
}));

export const locationRedirectLock = createAction(
    ActionTypeKeys.LOCATION_REDIRECT_LOCK,
    (locked: boolean) => ({ payload: { locked } }),
);

export const setRouteProjectId = createAction(ActionTypeKeys.SET_ROUTE_PROJECT_ID, (projectId: string) => ({
    payload: { projectId },
}));

export enum RouterEventActionTypeKeys {
    STORE_ROUTE_CHANGED = "STORE_ROUTE_CHANGED",
}

/**
 * The navigation landed: `route` and `previousRoute` in ONE semantic event, each
 * consumed by its own leaf (route_leaf_reducers.ts). LOCATION_CHANGED is a pure trigger: the router
 * saga computes the pair (the previous route is the pre-navigation `route` value it reads before
 * dispatching this), so no reducer needs a cross-key read — the ACTION carries the previous route.
 */
export const routeChanged = createAction(
    RouterEventActionTypeKeys.STORE_ROUTE_CHANGED,
    (route: IRouteState, previousRoute: IRouteState | undefined) => ({
        payload: { route, previousRoute },
    }),
);

// Saga coordination signals (SAGA/* strings) — dispatched by router_sagas, watched by other
// sagas; no reducer handles them.

export const routeParamsChanged = createAction(ActionTypeKeys.SAGA_ROUTE_PARAMS_CHANGED);

export const reportIdChanged = createAction(ActionTypeKeys.SAGA_REPORT_ID_CHANGED, (reportId: string) => ({
    payload: { reportId },
}));

export const sourceInsightChanged = createAction(
    ActionTypeKeys.SAGA_SOURCE_INSIGHT_CHANGED,
    (sourceInsightId: string) => ({ payload: { sourceInsightId } }),
);

export const openInAnalyticalDesignerAction = createAction(ActionTypeKeys.UI_OPEN_IN_ANALYTICAL_DESIGNER);
