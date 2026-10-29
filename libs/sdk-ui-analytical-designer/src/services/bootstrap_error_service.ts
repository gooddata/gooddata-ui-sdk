// (C) 2007-2026 GoodData Corporation

import { partial } from "lodash-es";

import {
    ACCESS_DESIGNER_DENIED_ERROR,
    ACCESS_WORKBENCH_DENIED_ERROR,
    CREATE_REPORT_DENIED_ERROR,
    NOT_AUTHENTICATED_ERROR,
    NOT_AUTHORIZED_ERROR,
} from "../constants/errors.js";
import { isFreemiumEdition } from "../selectors/feature_flag_selector.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { type IAppState } from "../store/types.js";
import { type IUriResolverParams, type UriResolver, getInfoUri, redirectTo } from "../utils/location.js";
import { getWorkspaceRef } from "../utils/uri.js";

export function getAccountPageUri({ location }: { location: Location }) {
    return `/account.html?lastUrl=${encodeURIComponent(location.href)}`;
}

const getProjectPageUri = (isFreeGrowthUser: boolean, status: string, workspacesRef = "projects") => {
    // If the current user is free or growth, redirecting to "workspaces.html" might cause him
    // to be redirected one more time to homepage. For that reason, we should redirect him directly to homepage.
    return isFreeGrowthUser ? "/home" : `/${workspacesRef}.html#status=${status}`;
};

const getDashboardUri: UriResolver = ({ projectId, isRenamingProjectToWorkspace }) => {
    const workspaceRef = getWorkspaceRef(isRenamingProjectToWorkspace);
    const workspaceSuf = getWorkspaceRef(isRenamingProjectToWorkspace, false);
    return `/#s=/gdc/${workspaceRef}/${projectId}|${workspaceSuf}DashboardPage`;
};

const getTigerDashboardUri: UriResolver = ({ projectId }) => `/workspace/${projectId}/dashboards`;

const getUnauthorizedUri = partial(getInfoUri, "ssoUnauthorized");

interface IErrorHandlers {
    [key: string]: (params: IUriResolverParams) => void;
}

interface IErrorHandlersByLoginType {
    normal: IErrorHandlers;
    sso: IErrorHandlers;
}

interface IErrorHandlersByAdTypeAndLoginType {
    main: IErrorHandlersByLoginType;
    embedded: IErrorHandlersByLoginType;
}

/*
 * Note how the authentication error handlers are (() => {}) for Tiger. This is because for Tiger, the app makes
 * use of the Analytical Backend / Authentication Provider capability to register global error handler for
 * NotAuthenticated errors. This handler is configured to redirect the browser window to location where
 * Tiger authentication flow starts.
 *
 * The benefit of the global not authenticated handler is, that it will respond to the error regardless at
 * which point it flies - as opposed to this logic which will only fire if NotAuthenticated happens during
 * bootstrap.
 */
function buildErrorHandler(
    adType: keyof IErrorHandlersByAdTypeAndLoginType,
    loginType: keyof IErrorHandlersByLoginType,
    type: string,
    workspacesRef: string,
    isFreeGrowthUser: boolean,
) {
    const errorHandlers: IErrorHandlersByAdTypeAndLoginType = {
        main: {
            normal: {
                [NOT_AUTHENTICATED_ERROR]: () => {},
                [NOT_AUTHORIZED_ERROR]: partial(
                    redirectTo,
                    partial(getProjectPageUri, isFreeGrowthUser, "notAuthorized", workspacesRef),
                ),
                [ACCESS_WORKBENCH_DENIED_ERROR]: partial(
                    redirectTo,
                    partial(getProjectPageUri, isFreeGrowthUser, "cannotAccessWorkbench", workspacesRef),
                ),
                [ACCESS_DESIGNER_DENIED_ERROR]: partial(redirectTo, getTigerDashboardUri),
                [CREATE_REPORT_DENIED_ERROR]: () => {},
            },
            sso: {
                [NOT_AUTHENTICATED_ERROR]: () => {},
                [NOT_AUTHORIZED_ERROR]: partial(redirectTo, getUnauthorizedUri),
                [ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, getUnauthorizedUri),
                [ACCESS_DESIGNER_DENIED_ERROR]: partial(redirectTo, getDashboardUri),
                [CREATE_REPORT_DENIED_ERROR]: () => {},
            },
        },
        embedded: {
            normal: {
                [NOT_AUTHENTICATED_ERROR]: () => {},
            },
            sso: {
                [NOT_AUTHENTICATED_ERROR]: () => {},
                [NOT_AUTHORIZED_ERROR]: partial(redirectTo, getUnauthorizedUri),
                [ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, getUnauthorizedUri),
                [ACCESS_DESIGNER_DENIED_ERROR]: () => {},
            },
        },
    };

    return errorHandlers[adType][loginType][type];
}

export function getErrorHandler(
    state: IAppState,
    { payload }: { payload: { error: { type: string } } },
    loggedInViaSso: boolean,
) {
    const adType: keyof IErrorHandlersByAdTypeAndLoginType = getIsEmbedded(state) ? "embedded" : "main";
    const loginType: keyof IErrorHandlersByLoginType = loggedInViaSso ? "sso" : "normal";
    const { type } = payload.error;
    const isFreeGrowthUser = isFreemiumEdition(state);
    return buildErrorHandler(adType, loginType, type, getWorkspaceRef(true), isFreeGrowthUser);
}
