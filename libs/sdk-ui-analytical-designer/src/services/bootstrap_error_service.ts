// (C) 2007-2026 GoodData Corporation

import { partial } from "lodash-es";

import {
    ACCESS_DESIGNER_DENIED_ERROR,
    ACCESS_WORKBENCH_DENIED_ERROR,
    CREATE_REPORT_DENIED_ERROR,
    NOT_AUTHENTICATED_ERROR,
    NOT_AUTHORIZED_ERROR,
} from "../constants/errors.js";
import { getIsEmbedded } from "../selectors/meta_selector.js";
import { type IAppState } from "../store/types.js";
import { type IUriResolverParams, type UriResolver, redirectTo } from "../utils/location.js";

const getHostLandingUri: UriResolver = () => "/";

const getTigerDashboardUri: UriResolver = ({ projectId }) => `/workspace/${projectId}/dashboards`;

interface IErrorHandlers {
    [key: string]: (params: IUriResolverParams) => void;
}

interface IErrorHandlersByAdType {
    main: IErrorHandlers;
    embedded: IErrorHandlers;
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
function buildErrorHandler(adType: keyof IErrorHandlersByAdType, type: string) {
    const errorHandlers: IErrorHandlersByAdType = {
        main: {
            [NOT_AUTHENTICATED_ERROR]: () => {},
            [NOT_AUTHORIZED_ERROR]: partial(redirectTo, getHostLandingUri),
            [ACCESS_WORKBENCH_DENIED_ERROR]: partial(redirectTo, getHostLandingUri),
            [ACCESS_DESIGNER_DENIED_ERROR]: partial(redirectTo, getTigerDashboardUri),
            [CREATE_REPORT_DENIED_ERROR]: () => {},
        },
        embedded: {
            [NOT_AUTHENTICATED_ERROR]: () => {},
        },
    };

    return errorHandlers[adType][type];
}

export function getErrorHandler(state: IAppState, { payload }: { payload: { error: { type: string } } }) {
    const adType: keyof IErrorHandlersByAdType = getIsEmbedded(state) ? "embedded" : "main";
    const { type } = payload.error;
    return buildErrorHandler(adType, type);
}
