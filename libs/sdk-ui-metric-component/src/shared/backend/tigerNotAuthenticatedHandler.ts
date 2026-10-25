// (C) 2022-2026 GoodData Corporation

import { throttle } from "lodash-es";

import { type IAuthenticationContext, NotAuthenticated } from "@gooddata/sdk-backend-spi";
import { createTigerAuthenticationUrl, redirectToTigerAuthentication } from "@gooddata/sdk-backend-tiger";

/**
 * Not authenticated handler will be called every time 401 is returned from tiger backend using SDK
 * auth calls. In this case, we want to change the app state so that user is not redirected
 * to login page straight away. The openNotAuthenticatedOverlay action is registered later
 * when the app is ready.
 */

let openNotAuthenticatedOverlay: (err: NotAuthenticatedError) => void;

/**
 * @internal
 */
export function initOpenNotAuthenticatedOverlay(callback: (err: NotAuthenticatedError) => void): void {
    openNotAuthenticatedOverlay = callback;
}

const debouncedRedirectHandler = throttle(redirectToTigerAuthentication, 500, {
    leading: false,
    trailing: true,
});

/**
 * @internal
 */
export class NotAuthenticatedError extends NotAuthenticated {
    constructor(
        message: string,
        public readonly redirectLink: string,
        public override readonly cause?: Error,
    ) {
        super(message, cause);
    }
}

/**
 * @internal
 */
export function notAuthenticatedHandler(ctx: IAuthenticationContext, err: NotAuthenticated): void {
    if (openNotAuthenticatedOverlay && err.authenticationFlow) {
        const tigerAuthenticationUrl = createTigerAuthenticationUrl(
            ctx.backend,
            err.authenticationFlow,
            window.location,
        );

        return openNotAuthenticatedOverlay(
            new NotAuthenticatedError(err.message, tigerAuthenticationUrl, err),
        );
    } else {
        return debouncedRedirectHandler(ctx, err);
    }
}
