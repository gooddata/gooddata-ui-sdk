// (C) 2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import { type IAppState } from "../types.js";

import { type IRouteParams, type IRouteState } from "./router_state.js";

/**
 * The router domain's read layer.
 *
 * Three input selectors, one per tree position the domain owns; everything else is typed
 * property access on top of them. The route values are `null` in the store until the first
 * LOCATION_CHANGED / SET_ROUTE_PROJECT_ID writes them (see router_state.ts); the two input
 * selectors convert to `undefined`, so every accessor tolerates the same absence shape it always
 * has — that is the reason the leaves are optional chains rather than a `sliceSelector` with an
 * initial state.
 *
 * The cross-domain route predicates (full-reload rules, KD embedding) stay in
 * selectors/route_selector.ts: they compose appReady / isEmbedded and are not router-owned.
 */
export const getRouteState = (state: IAppState): IRouteState | undefined => state.route ?? undefined;
export const getPreviousRouteState = (state: IAppState): IRouteState | undefined =>
    state.previousRoute ?? undefined;

/**
 * The redirect lock the save flow holds while it rewrites the hash. The slice owns the key, so the
 * `false` default only ever fires for a hand-built fixture that omits it.
 */
export const getLocationRedirectLock = (state: IAppState): boolean => state.appState.locationRedirectLock;

export const getRouteParams = createSelector(
    getRouteState,
    (route): IRouteParams | undefined => route?.params,
);
export const getPreviousRouteParams = createSelector(
    getPreviousRouteState,
    (route): IRouteParams | undefined => route?.params,
);

type RouteQuery = NonNullable<IRouteParams["query"]>;

const getRouteQuery = createSelector(getRouteParams, (params): RouteQuery | undefined => params?.query);
const getPreviousRouteQuery = createSelector(
    getPreviousRouteParams,
    (params): RouteQuery | undefined => params?.query,
);

/**
 * Query-param accessors are declared as one-liners off the query object rather than as
 * `createSelector`s: each returns a primitive, so there is nothing to memoize, and a chain of
 * memoized wrappers over a plain property read would only add cache slots.
 */
const routeQueryParam =
    <K extends keyof RouteQuery>(key: K) =>
    (state: IAppState): RouteQuery[K] =>
        getRouteQuery(state)?.[key];

const previousRouteQueryParam =
    <K extends keyof RouteQuery>(key: K) =>
    (state: IAppState): RouteQuery[K] =>
        getPreviousRouteQuery(state)?.[key];

// route.params leaves
export const getRouteProjectId = (state: IAppState): string | undefined => getRouteParams(state)?.projectId;
export const getRouteReportId = (state: IAppState): string | undefined => getRouteParams(state)?.reportId;
export const getRouteForceReload = (state: IAppState): boolean | undefined =>
    getRouteParams(state)?.forceReload;
export const getRouteExplainRequested = (state: IAppState): boolean | undefined =>
    getRouteParams(state)?.explainRequested;

// previousRoute.params leaves
export const getPreviousRouteProjectId = (state: IAppState): string | undefined =>
    getPreviousRouteParams(state)?.projectId;
export const getPreviousRouteReportId = (state: IAppState): string | undefined =>
    getPreviousRouteParams(state)?.reportId;

// route.params.query leaves
export const getRouteQueryDataset = routeQueryParam("dataset");
export const getRouteQueryInclude = routeQueryParam("includeObjectsWithTags");
export const getRouteQueryExclude = routeQueryParam("excludeObjectsWithTags");
export const getRouteQueryHideControl = routeQueryParam("hideControl");
export const getRouteQuerySourceDashboard = routeQueryParam("sourceDashboard");
export const getRouteQuerySourceInsight = routeQueryParam("sourceInsight");
export const getRouteQueryHideAction = routeQueryParam("hideAction");
export const getRouteQueryDisplayAction = routeQueryParam("displayAction");
export const getRouteQueryAllowDashboardLinks = routeQueryParam("allowDashboardLinks");
export const getRouteQueryIsEmbeddedFromKD = routeQueryParam("isEmbeddedFromKD");
export const getRouteQueryShowEmbedButton = routeQueryParam("showEmbedButton");
export const getRouteQueryExplainType = routeQueryParam("explainType");
export const getRouteQueryAsOfDate = routeQueryParam("asOfDate");
export const getRouteQueryThousandSeparator = routeQueryParam("thousandSeparator");
export const getRouteQueryDecimalSeparator = routeQueryParam("decimalSeparator");

// previousRoute.params.query leaves
export const getPreviousRouteQueryDataset = previousRouteQueryParam("dataset");
export const getPreviousRouteQueryInclude = previousRouteQueryParam("includeObjectsWithTags");
export const getPreviousRouteQueryExclude = previousRouteQueryParam("excludeObjectsWithTags");
export const getPreviousRouteQuerySourceInsight = previousRouteQueryParam("sourceInsight");
