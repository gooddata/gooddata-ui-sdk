// (C) 2007-2026 GoodData Corporation

import { stringify as queryStringStringify } from "query-string";

import { DEFAULT_REPORT_ID, defaultRouteParams } from "../constants/route_params.js";
import { getVirtualNavigate } from "../embedding/virtualLocation.js";
import { getRouteParams as getRouteParamsState } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { type ICustomRouteParams } from "../typings/location.js";

import { parseHash } from "./hash_parser.js";
import { sanitizeRouteParams } from "./id_prefix_sanitize.js";
import { omitNil } from "./object.js";

export function getCurrentHash() {
    return window.location.hash;
}

export function getRouteParams(
    appState: IAppState,
    options: Partial<ICustomRouteParams> = {},
): ICustomRouteParams {
    // route.params is ABSENT until the first navigation, hence the optional chains and the
    // reportId default.
    const routeParams = getRouteParamsState(appState);
    const query = routeParams?.query;

    return omitNil({
        dataset: query?.dataset,
        projectId: routeParams?.projectId,
        reportId: routeParams?.reportId ?? DEFAULT_REPORT_ID,
        includeObjectsWithTags: query?.includeObjectsWithTags,
        excludeObjectsWithTags: query?.excludeObjectsWithTags,
        ...options,
        hideControl: query?.hideControl,
        sourceDashboard: query?.sourceDashboard,
        sourceInsight: query?.sourceInsight,
        hideAction: query?.hideAction,
        displayAction: query?.displayAction,
        allowDashboardLinks: query?.allowDashboardLinks,
        isEmbeddedFromKD: query?.isEmbeddedFromKD,
        showEmbedButton: query?.showEmbedButton,
        apiTokenAuthentication: query?.apiTokenAuthentication,
    });
}

export function getBaseUri(params: Partial<ICustomRouteParams>) {
    return `#/${params.reportId}/edit`;
}

function getQueryParams(params: Partial<ICustomRouteParams>) {
    const query = queryStringStringify(
        omitNil({
            dataset: params.dataset,
            includeObjectsWithTags: params.includeObjectsWithTags,
            excludeObjectsWithTags: params.excludeObjectsWithTags,
            hideControl: params.hideControl,
            sourceDashboard: params.sourceDashboard,
            sourceInsight: params.sourceInsight,
            hideAction: params.hideAction,
            displayAction: params.displayAction,
            allowDashboardLinks: params.allowDashboardLinks,
            isEmbeddedFromKD: params.isEmbeddedFromKD,
            showEmbedButton: params.showEmbedButton,
            apiTokenAuthentication: params.apiTokenAuthentication,
        }),
    );

    return query === "" ? "" : `?${query}`;
}

export function getRouteUri(state: IAppState, options: Partial<ICustomRouteParams> = {}) {
    const params = getRouteParams(state, options);

    // The host owns the pathname (/workspace/<id>/analyze); emit a hash-only URI so setLocation
    // can change window.location.hash without disturbing it. decodeURIComponent keeps the brackets
    // in the query params unencoded.
    return decodeURIComponent(`${getBaseUri(params)}${getQueryParams(params)}`);
}

// Host-shell URI for the current route: the host owns /workspace/<id>/analyze, so the
// hash carries only the non-workspace bits, same shape the pluggable router emits.
export function getInfoUri(status: string) {
    return `/account.html#/info/${status}`;
}

export interface IUriResolverParams {
    projectId: string;
    location?: Location;
    isRenamingProjectToWorkspace?: boolean;
}

export type UriResolver = (params: IUriResolverParams) => string;

export function redirectTo(
    getUri: UriResolver,
    { projectId, location = window.location, isRenamingProjectToWorkspace = false }: IUriResolverParams,
) {
    location.href = getUri({ projectId, location, isRenamingProjectToWorkspace });
}

export function createRouteParams(customRouteParams: ICustomRouteParams): ICustomRouteParams {
    const { includeObjectsWithTags, excludeObjectsWithTags } = customRouteParams;

    if (includeObjectsWithTags && excludeObjectsWithTags) {
        return {
            ...defaultRouteParams,
            ...sanitizeRouteParams(customRouteParams),
            excludeObjectsWithTags: null,
        };
    }

    return {
        ...defaultRouteParams,
        ...sanitizeRouteParams(customRouteParams),
    };
}

export function shouldWaitForInjectedApiToken() {
    const locationHash = parseHash(getCurrentHash());
    const isApiTokenAuthentication = locationHash?.query?.apiTokenAuthentication === "true";
    return window.EMBEDDED && isApiTokenAuthentication;
}

export function setLocation(location: string) {
    // Hosted-component mode: navigation goes to the memory router, never to the real browser URL.
    const virtualNavigate = getVirtualNavigate();
    if (virtualNavigate) {
        virtualNavigate(location);
        return;
    }
    // Hash-only URIs (used by pluggable mode) mutate just window.location.hash
    // so the host-owned pathname isn't disturbed. Anything else is a full
    // navigation via .href.
    if (location.startsWith("#")) {
        window.location.hash = location;
        return;
    }
    window.location.href = location;
}
