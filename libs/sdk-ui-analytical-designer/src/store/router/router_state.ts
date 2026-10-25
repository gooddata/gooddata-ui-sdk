// (C) 2026 GoodData Corporation

import { type IHashFragments } from "../../utils/hash_parser.js";

/**
 * Route params as stored at `route.params` / `previousRoute.params`: the parsed hash fragments
 * with `reportId` guaranteed by the DEFAULT_REPORT_ID fallback (see router_helpers), plus the
 * host-owned `projectId` (set once via SET_ROUTE_PROJECT_ID at mount, never parsed from the hash).
 */
export interface IRouteParams extends Omit<IHashFragments, "reportId"> {
    projectId?: string;
    reportId: string;
}

/**
 * The router domain's state, at three positions: `route` and `previousRoute` at the root, plus the
 * `appState.locationRedirectLock` boolean. Both route values are `null` in the store until the first
 * LOCATION_CHANGED / SET_ROUTE_PROJECT_ID writes them, and read as `undefined` through the input
 * selectors — "no navigation yet" is a real, distinguishable shape.
 */
export interface IRouteState {
    params: IRouteParams;
}
