// (C) 2026 GoodData Corporation

import { defaults } from "lodash-es";

import { DEFAULT_REPORT_ID } from "../../constants/route_params.js";
import { parseHash } from "../../utils/hash_parser.js";

import { type IRouteParams, type IRouteState } from "./router_state.js";

/**
 * The router domain's pure value-level rules, over `IRouteState` values. The boundary that
 * reads/writes the store is `sagas/router_sagas.ts` (the LOCATION_CHANGED flow) plus the two leaf
 * reducers (route_leaf_reducers.ts).
 */

const defaultParams = {
    reportId: DEFAULT_REPORT_ID,
};

/**
 * The next `route` value for a navigation. The workspace identifier is owned by the host (set once
 * via SET_ROUTE_PROJECT_ID at mount), not by the hash — the current route's projectId is carried
 * over instead of being wiped by the workspace-less hash.
 */
export function buildNextRoute(hash: string, currentRoute: IRouteState | undefined): IRouteState {
    const parsedParams = parseHash(hash);

    const params: IRouteParams = {
        ...defaults(parsedParams, defaultParams),
        projectId: currentRoute?.params.projectId,
    };

    return { params };
}

/**
 * Materializes the params branch even when the route value does not exist yet. Deliberately writes
 * ONLY projectId: reportId stays absent until the first LOCATION_CHANGED, which
 * {@link shouldResetOnNavigation} relies on for the first-navigation reset.
 */
export function withRouteProjectId(route: IRouteState | undefined, projectId: string): IRouteState {
    return { ...route, params: { ...route?.params, projectId } as IRouteParams };
}

/**
 * A navigation that clears the open report back to the default one resets the WHOLE application.
 * Pure over the route/previousRoute pair the router saga just built. The first navigation with no
 * previous route and the default report id deliberately COUNTS — previousReportId is absent, so it
 * differs. (The workspace cannot change by navigation: the host owns it and a workspace switch
 * remounts the application.)
 */
export function shouldResetOnNavigation(route: IRouteState, previousRoute: IRouteState | undefined): boolean {
    const datasetParamChanged = route.params.query?.dataset !== previousRoute?.params.query?.dataset;
    const reportId = route.params.reportId;
    const previousReportId = previousRoute?.params.reportId;

    return !datasetParamChanged && reportId !== previousReportId && reportId === DEFAULT_REPORT_ID;
}
