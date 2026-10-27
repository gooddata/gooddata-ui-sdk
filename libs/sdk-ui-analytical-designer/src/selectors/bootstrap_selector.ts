// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { TOP_BAR } from "../constants/route_params.js";
import { getBootstrapDataState, getProjectIdState } from "../store/app_context/app_context_selectors.js";
import {
    getRouteQueryDecimalSeparator,
    getRouteQueryHideControl,
    getRouteQueryThousandSeparator,
} from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";

import { getIsEmbedded } from "./meta_selector.js";

export const bootstrapData = (state: IAppState): IBootstrapData | null => getBootstrapDataState(state);

// BEAR
export const hasWorkspaceAccess = createSelector([bootstrapData], () => {
    // Tiger does not support workspaces yet
    return true;
});

// PROJECT
export function getProjectId(state: IAppState): string | undefined {
    return getProjectIdState(state) ?? undefined;
}

export const getCurrentProjectInfo = createSelector([bootstrapData], (data) => data?.project);

export const getProjectTemplate = createSelector(
    [bootstrapData],
    (bootstrap) => bootstrap?.project?.templateUrl,
);

export const getProjectTimezoneOffset = createSelector(
    [bootstrapData],
    (bootstrap) => bootstrap?.project?.timezoneOffset,
);

// UI SETTINGS
export const getOrganizationName = createSelector(
    [bootstrapData],
    (data) => data?.uiSettings?.organizationName,
);

export const logoUrl = createSelector([bootstrapData], (data) => data?.uiSettings?.logoUrl);

export const activeColor = createSelector([bootstrapData], (data) => data?.uiSettings?.activeColor);

export const headerColor = createSelector([bootstrapData], (data) => data?.uiSettings?.headerColor);

export const headerTextColor = createSelector([bootstrapData], (data) => data?.uiSettings?.headerTextColor);

export const displayAccountPage = createSelector(
    [bootstrapData],
    (data) => data?.uiSettings?.displayAccountPage,
);

export const isBranded = createSelector([bootstrapData], (data) => data?.uiSettings?.isBranded);

export const documentationUrl = createSelector([bootstrapData], (data) => data?.uiSettings?.documentationUrl);

export const getSSOExpiredUrl = createSelector([bootstrapData], (data) => data?.uiSettings?.ssoExpiredUrl);

export const getSSOUnauthorizedUrl = createSelector(
    [bootstrapData],
    (data) => data?.uiSettings?.ssoUnauthorizedUrl,
);

export const showSSOCustomUnauthorizedLoginPage = createSelector(
    [bootstrapData],
    (data) => data?.uiSettings?.showSSOCustomUnauthorizedLoginPage,
);

// USER
export const getUserUri = createSelector([bootstrapData], (data) => data?.user?.uri);

export const getOrganizationId = createSelector([bootstrapData], (data) => {
    const organizationId = data?.uiSettings?.organizationId;
    if (organizationId) {
        return organizationId;
    }
    const domainUri = data?.user?.domain;
    if (domainUri) {
        const lastIndexOfSlash = domainUri.lastIndexOf("/");
        return domainUri.substr(lastIndexOfSlash + 1);
    }
    return undefined;
});

export const getUserId = createSelector([getUserUri], (userUri) => userUri?.split("/").pop());

export const getUserLoginMD5 = createSelector([bootstrapData], (data) => data?.user?.loginMD5);

export const getUserEmail = createSelector([bootstrapData], (data) => data?.user?.email);
export const getUserEmailDomain = createSelector([getUserEmail], (email) => email?.split("@").pop());

// Due to circular dependency (bootstrap_selector -> route_selector -> feature_flag_selector -> bootstrap_selector),
// we need to have route selectors here, even though they do not belong here. They read through the
// router domain's own selectors (store/router/router_selectors.ts), which import nothing from this
// layer — so the cycle these two were extracted to dodge stays broken.
export function getRouteSeparatorThousand(state: IAppState) {
    return getRouteQueryThousandSeparator(state);
}

export function getRouteSeparatorDecimal(state: IAppState) {
    return getRouteQueryDecimalSeparator(state);
}

export const getSeparators = createSelector(
    [bootstrapData, getRouteSeparatorThousand, getRouteSeparatorDecimal],
    (bootstrapDataState, routeSeparatorThousand, routeSeparatorDecimal) => {
        const stateSeparators = bootstrapDataState?.user?.separators;
        const thousandSeparator = routeSeparatorThousand ?? stateSeparators?.thousand;
        const decimalSeparator = routeSeparatorDecimal ?? stateSeparators?.decimal;

        if (!thousandSeparator && !decimalSeparator) {
            return undefined;
        }

        return {
            thousand: thousandSeparator,
            decimal: decimalSeparator,
        };
    },
);

export const stashedProjectUri = createSelector([bootstrapData], (data) => data?.user?.stashedProjectUri);

export const userLanguage = createSelector([bootstrapData], (data) => data?.user?.language);

export const getFormatLocale = createSelector([bootstrapData], (data) => data?.user?.formatLocale);

function getHideControlParams(state: IAppState): string[] {
    /**
     * The value was entered from url, it can be any string.
     * Then validation type here is required
     */
    const rawValue: string = getRouteQueryHideControl(state) || "";
    return rawValue.substr(1, rawValue.length - 2).split(",");
}

export function isTopBarHidden(state: IAppState): boolean {
    const isEmbedded = getIsEmbedded(state);
    const hideControlParams: string[] = getHideControlParams(state);
    const isHiddenTopBarParamEnabled = hideControlParams.includes(TOP_BAR);
    return isEmbedded && isHiddenTopBarParamEnabled;
}

export const getMapboxToken = createSelector([bootstrapData], (data) => data?.mapboxToken);

export const getAgGridToken = createSelector([bootstrapData], (data) => data?.agGridToken);

export const getMaxZoomLevel = createSelector([bootstrapData], (data) => data?.maxZoomLevel);
