// (C) 2022-2026 GoodData Corporation

import { throttle } from "lodash-es";

import { type IAuthenticationContext, type NotAuthenticated } from "@gooddata/sdk-backend-spi";
import { createRedirectToTigerAuthenticationWithParams } from "@gooddata/sdk-backend-tiger";

import { shouldWaitForInjectedApiToken } from "./utils/location.js";

/**
 * Not authenticated handler is called every time 401 is returned from tiger backend using SDK
 * auth calls. It redirects the browser to the tiger authentication page, unless the app waits
 * for an injected API token, in which case the host owns the auth lifecycle.
 */
export function createNotAuthenticatedHandler(
    externalProviderId?: string,
): (ctx: IAuthenticationContext, err: NotAuthenticated) => void {
    const params = externalProviderId ? { externalProviderId } : undefined;
    const redirectHandler = createRedirectToTigerAuthenticationWithParams(params);
    const debouncedRedirectHandler = throttle(redirectHandler, 500, {
        leading: false,
        trailing: true,
    });
    return (ctx: IAuthenticationContext, err: NotAuthenticated) => {
        if (shouldWaitForInjectedApiToken()) {
            // noop for token authentication
            return;
        }

        return debouncedRedirectHandler(ctx, err);
    };
}
