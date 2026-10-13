// (C) 2026 GoodData Corporation

import { throttle } from "lodash-es";

import { type IAuthenticationContext, type NotAuthenticated } from "@gooddata/sdk-backend-spi";
import {
    type RedirectToTigerAuthenticationHandler,
    createRedirectToTigerAuthenticationWithParams,
    redirectToTigerAuthentication,
} from "@gooddata/sdk-backend-tiger";

/** Not authenticated handler will be called every time 401 is returned from Tiger backend. */

export function createNotAuthenticatedHandler(
    externalProviderId?: string,
    redirectHandler: RedirectToTigerAuthenticationHandler = externalProviderId
        ? createRedirectToTigerAuthenticationWithParams({ externalProviderId })
        : redirectToTigerAuthentication,
): (ctx: IAuthenticationContext, err: NotAuthenticated) => void {
    // Boot fires several requests in parallel. Redirect on the first 401 and ignore the rest.
    const throttledRedirectHandler = throttle(redirectHandler, 500, {
        leading: true,
        trailing: false,
    });

    return (ctx: IAuthenticationContext, err: NotAuthenticated) => {
        throttledRedirectHandler(ctx, err);
    };
}
