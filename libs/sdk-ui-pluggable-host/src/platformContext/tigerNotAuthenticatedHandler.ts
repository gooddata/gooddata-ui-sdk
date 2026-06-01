// (C) 2026 GoodData Corporation

import { throttle } from "lodash-es";

import { type IAuthenticationContext, type NotAuthenticated } from "@gooddata/sdk-backend-spi";
import {
    createRedirectToTigerAuthenticationWithParams,
    redirectToTigerAuthentication,
} from "@gooddata/sdk-backend-tiger";

/** Not authenticated handler will be called every time 401 is returned from Tiger backend. */

export function createNotAuthenticatedHandler(
    externalProviderId?: string,
): (ctx: IAuthenticationContext, err: NotAuthenticated) => void {
    const redirectHandler = externalProviderId
        ? createRedirectToTigerAuthenticationWithParams({ externalProviderId })
        : redirectToTigerAuthentication;
    const debouncedRedirectHandler = throttle(redirectHandler, 500, {
        leading: false,
        trailing: true,
    });

    return (ctx: IAuthenticationContext, err: NotAuthenticated) => {
        debouncedRedirectHandler(ctx, err);
    };
}
