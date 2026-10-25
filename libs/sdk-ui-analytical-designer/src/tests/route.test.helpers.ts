// (C) 2026 GoodData Corporation

import { type IRouteParams } from "../store/router/router_state.js";
import { type IAppState } from "../store/types.js";

/**
 * Route fixture builders: a typed patch of `route.params` / `previousRoute.params`.
 *
 * Both subtrees are ABSENT in the pristine state (see store/router/router_state.ts), so these
 * builders materialize them.
 */

type RouteQuery = NonNullable<IRouteParams["query"]>;

const patchParams = (
    key: "route" | "previousRoute",
    state: IAppState,
    params: Partial<IRouteParams>,
): IAppState => ({
    ...state,
    [key]: { params: { ...state[key]?.params, ...params } as IRouteParams },
});

export const withRouteParams = (state: IAppState, params: Partial<IRouteParams>): IAppState =>
    patchParams("route", state, params);

export const withPreviousRouteParams = (state: IAppState, params: Partial<IRouteParams>): IAppState =>
    patchParams("previousRoute", state, params);

export const withRouteQuery = (state: IAppState, query: RouteQuery): IAppState =>
    patchParams("route", state, { query: { ...state.route?.params?.query, ...query } });

export const withPreviousRouteQuery = (state: IAppState, query: RouteQuery): IAppState =>
    patchParams("previousRoute", state, { query: { ...state.previousRoute?.params?.query, ...query } });
