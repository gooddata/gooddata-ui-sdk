// (C) 2019-2023 GoodData Corporation
import {
    AuthenticationFlow,
    IAnalyticalBackend,
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    IAuthenticationProvider,
    NotAuthenticated,
    NotAuthenticatedHandler,
} from "@gooddata/sdk-backend-spi";
import { ITigerClient, setAxiosAuthorizationToken, IUserProfile } from "@gooddata/api-client-tiger";

import { convertApiError } from "./utils/errorHandling.js";

/**
 * Base for other IAuthenticationProvider implementations.
 *
 * @public
 */
export abstract class TigerAuthProviderBase implements IAuthenticationProvider {
    protected principal: IAuthenticatedPrincipal | undefined;

    public abstract authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;

    public deauthenticate(context: IAuthenticationContext): Promise<void> {
        const logoutUrl = createTigerDeauthenticationUrl(context.backend, window.location);
        return Promise.resolve(window.location.assign(logoutUrl));
    }

    public async getCurrentPrincipal(
        context: IAuthenticationContext,
    ): Promise<IAuthenticatedPrincipal | null> {
        if (!this.principal) {
            await this.obtainCurrentPrincipal(context);
        }

        return this.principal || null;
    }

    protected async obtainCurrentPrincipal(context: IAuthenticationContext): Promise<void> {
        const profile = await this.loadProfile(context);

        this.principal = {
            userId: profile.userId ?? "n/a",
            userMeta: profile,
        };
    }

    private async loadProfile(context: IAuthenticationContext): Promise<IUserProfile> {
        const client = context.client as ITigerClient;

        try {
            return await client.profile.getCurrent();
        } catch (err) {
            throw convertApiError(err as Error);
        }
    }
}

/**
 * This implementation of authentication provider uses an API Token as bearer of authentication.
 *
 * @remarks
 * You can provide token at construction time and it will be passed on all calls to Tiger APIs
 *
 * This is a go-to authentication provider for command-line applications. While nothing stops you from using
 * this provider in UI applications, keep in mind that this is discouraged due to security holes it leads to; having
 * the token hardcoded in a UI application means anyone can find it and use it for themselves.
 *
 * @public
 */
export class TigerTokenAuthProvider extends TigerAuthProviderBase {
    public constructor(
        private readonly apiToken: string,
        private readonly notAuthenticatedHandler?: NotAuthenticatedHandler,
    ) {
        super();
    }

    public initializeClient(client: ITigerClient): void {
        setAxiosAuthorizationToken(client.axios, this.apiToken);
    }

    public onNotAuthenticated = (context: IAuthenticationContext, error: NotAuthenticated): void => {
        this.notAuthenticatedHandler?.(context, error);
    };

    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }
}

/**
 * This implementation of authentication provider defers the responsibility for performing authentication
 * to the context in which it exists.
 *
 * @remarks
 * In other words it expects that the application will take care of driving
 * the authentication and creating a correct session in which the Tiger backend can make authenticated calls.
 *
 * This is a go-to authentication provider for UI applications. The entire flow is as follows:
 *
 * -  The application that uses backend configured with this provider must expect that some of the backend
 *    calls with result in NotAuthenticated exception.
 *
 * -  The exception will contain `loginUrl` set to the URL on the current origin - this is location of the login page.
 *
 * -  The application must redirect the entire window to this URL appended with `redirectTo` query parameter.
 *
 * -  The value of this parameter is the application's URL that will be used as a return location.
 *
 * -  The login page will start and drive the OIDC authentication flow. Once the flow finishes and session
 *    is set up, the login page will redirect back to the application.
 *
 * You may use the provider's ability to use passed `NotAuthenticatedHandler` function. This will be called
 * every time a NotAuthenticated error is raised by the backend. Your application can pass a custom handler of
 * this event - typically something that will start driving the authentication from a single place.
 *
 * Note: the not authenticated handler MAY be called many times in succession so you may want to wrap it in a
 * call guard or in a debounce.
 *
 * See {@link redirectToTigerAuthentication} for implementation of the NotAuthenticated handler which
 * you may use with this provider.
 * @public
 */
export class ContextDeferredAuthProvider extends TigerAuthProviderBase {
    public constructor(private readonly notAuthenticatedHandler?: NotAuthenticatedHandler) {
        super();
    }

    public onNotAuthenticated = (context: IAuthenticationContext, error: NotAuthenticated): void => {
        this.notAuthenticatedHandler?.(context, error);
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }
}

/**
 * Given tiger backend, authentication flow details and current location, this function creates URL where the
 * browser should redirect to start authentication flow with correct return address.
 *
 * @remarks
 * The current location is essential to determine whether the return redirect should contain absolute or
 * related return path:
 *
 * -  When running on same origin, then use relative path
 *
 * -  When running on different origin, then use absolute path
 *
 * @param backend - an instance of analytical backend
 * @param authenticationFlow - details about the tiger authentication flow
 * @param location - current location
 * @public
 */
export function createTigerAuthenticationUrl(
    backend: IAnalyticalBackend,
    authenticationFlow: AuthenticationFlow,
    location: Location,
): string {
    let host = `${location.protocol}//${location.host}`;
    let returnAddress = `${location.pathname ?? ""}${location.search ?? ""}${location.hash ?? ""}`;
    const { hostname: backendHostname } = backend.config;

    if (backendHostname && backendHostname !== host) {
        // different origin. app must redirect to the backend hostname
        host = backendHostname;
        // but have return to current hostname
        returnAddress = location.href;
    }

    return `${host}${authenticationFlow.loginUrl}?${
        authenticationFlow.returnRedirectParam
    }=${encodeURIComponent(returnAddress)}`;
}

/**
 * Given tiger backend and current location, this function creates URL where the
 * browser should redirect to start deauthentication (logout) flow.
 *
 * @remarks
 * The current location is essential to determine the URL should point:
 *
 * -  When running on same origin, then use relative path
 *
 * -  When running on different origin, then use absolute path to the proper origin
 *
 * @param backend - an instance of analytical backend
 * @param location - current location
 * @public
 */
export function createTigerDeauthenticationUrl(backend: IAnalyticalBackend, location: Location): string {
    let host = `${location.protocol}//${location.host}`;
    const { hostname: backendHostname } = backend.config;

    if (backendHostname && backendHostname !== host) {
        // different origin. app must redirect to the backend hostname
        host = backendHostname;
    }

    return `${host}/logout`;
}

/**
 * Given authentication context and the authentication error, this implementation of `NotAuthenticatedHandler`
 * will redirect current window to location where Tiger authentication flow will start.
 *
 * @remarks
 * The location will be setup with correct return address so that when the flow finishes successfully, the
 * browser window will be redirected from whence it came.
 *
 * See also {@link createTigerAuthenticationUrl}; this function is used to construct the URL. You may use
 *  it when build your own handler.
 *
 * @param context - authentication context
 * @param error - not authenticated error, must contain the `authenticationFlow` information otherwise the
 *  handler just logs an error and does nothing
 * @public
 */
export function redirectToTigerAuthentication(
    context: IAuthenticationContext,
    error: NotAuthenticated,
): void {
    if (!error.authenticationFlow) {
        console.error("Analytical Backend did not provide detail where to start authentication flow. ");

        return;
    }

    window.location.href = createTigerAuthenticationUrl(
        context.backend,
        error.authenticationFlow,
        window.location,
    );
}
