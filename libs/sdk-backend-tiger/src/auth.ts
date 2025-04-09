// (C) 2019-2025 GoodData Corporation
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
import { invariant } from "ts-invariant";

import { convertApiError } from "./utils/errorHandling.js";
import { validateJwt, computeExpirationReminderTimeout } from "./utils/jwt.js";

/**
 * Base for other IAuthenticationProvider implementations.
 *
 * @public
 */
export abstract class TigerAuthProviderBase implements IAuthenticationProvider {
    protected principal: IAuthenticatedPrincipal | undefined;
    public disablePrincipalCache = false;

    public abstract authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;

    public deauthenticate(context: IAuthenticationContext, returnTo?: string): Promise<void> {
        const logoutUrl = createTigerDeauthenticationUrl(context.backend, window.location, returnTo);
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
    // TigerBackend has factory methods that will return new instance of itself recreated with provided
    // parameters. AuthProvider instance (this class) is forwarded to the new instance but client is
    // recreated. Various components keep reference to previous instances of TigerBackend that uses the
    // previous clients instances to make Axios calls. This could be probably bug in some cases.
    // These clients would not get token updated and if token has expiration, the next API call would
    // fail and application would logout the user from the session. The token auth provider must keep the
    // reference to all these clients to update their tokens if needed.
    private clients: ITigerClient[] = [];

    public constructor(
        private apiToken: string,
        private readonly notAuthenticatedHandler?: NotAuthenticatedHandler,
    ) {
        super();
    }

    public initializeClient(client: ITigerClient): void {
        setAxiosAuthorizationToken(client.axios, this.apiToken);

        // Keep reference to each new unique tiger client instance for token re-initialization purposes.
        if (!this.clients.includes(client)) {
            this.clients.push(client);
        }
    }

    public onNotAuthenticated = (context: IAuthenticationContext, error: NotAuthenticated): void => {
        this.notAuthenticatedHandler?.(context, error);
    };

    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        await this.obtainCurrentPrincipal(context);

        return this.principal!;
    }

    public updateApiToken = (apiToken: string): void => {
        invariant(this.clients.length > 0, "The method cannot be called before initializeClient method.");
        this.apiToken = apiToken;
        this.clients.forEach((client) => this.initializeClient(client));
    };
}

/**
 * Callback that is used to set the new JWT value before original token expires.
 *
 * Optionally, the callback accepts the number of seconds before the token expiration in which
 * JwtIsAboutToExpireHandler will be called the next time. Expiration reminder will not be called
 * when value is not provided or it is not greater than zero.
 *
 * @alpha
 */
export type SetJwtCallback = (jwt: string, secondsBeforeTokenExpirationToCallReminder?: number) => void;

/**
 * Handler that will be called by a JWT authentication provider before the JWT
 * is about to expire. The handler will receive a method that can be used to set a new JWT value.
 *
 * The method throws an exception when the provided JWT is not for the same subject as the previously set
 * JWT (if such token was already set).
 *
 * @alpha
 */
export type JwtIsAboutToExpireHandler = (setJwt: SetJwtCallback) => void;

const DEFAULT_EXPIRATION_REMINDER_IN_SECONDS = 60;

/**
 * The implementation of authentication provider uses an JWT (JSON Web Token) as bearer of authentication.
 *
 * @remarks
 * You can provide token at construction time, and it will be passed on all calls to Tiger APIs.
 *
 * Keep in mind that this authentication provider can lead to security holes; having
 * the token available as JavaScript variable in an UI application means anyone can find it and use it for
 * themselves while the token is valid. UI applications should prefer {@link ContextDeferredAuthProvider}
 * instead.
 *
 * @alpha
 */
export class TigerJwtAuthProvider extends TigerTokenAuthProvider {
    // use "any" instead of "number" used by browser or "Timeout" used by NodeJS to not get type error in
    // the opposite platform than the one being used
    private expirationReminderId: any = -1;

    /**
     * Create a new instance of TigerJwtAuthProvider
     *
     * @param jwt - The JSON Web Token value.
     * @param notAuthenticatedHandler - Optional handler called when auth provider encounters
     *  "non-authenticated" error (for example when session is no longer valid due to expired JWT).
     * @param tokenIsAboutToExpireHandler - Optional handler called when JWT is about to expire. The handler
     *  will receive function that can be used to set the new JWT to continue the current session.
     * @param secondsBeforeTokenExpirationToCallReminder - The number of seconds before token expiration to
     *  call tokenIsAboutToExpireHandler handler. The handler is called only when the value is positive number
     *  greater than zero and tokenIsAboutToExpireHandler handler value is provided.
     */
    public constructor(
        private jwt: string,
        notAuthenticatedHandler?: NotAuthenticatedHandler,
        private readonly tokenIsAboutToExpireHandler?: JwtIsAboutToExpireHandler,
        private secondsBeforeTokenExpirationToCallReminder = DEFAULT_EXPIRATION_REMINDER_IN_SECONDS,
    ) {
        super(jwt, notAuthenticatedHandler);
        this.startReminder(jwt);
    }

    public initializeClient(client: ITigerClient): void {
        super.initializeClient(client);
    }

    /**
     * Update JWT value of the API client
     *
     * @param jwt - new JWT value
     * will receive function that can be used to set the new JWT to continue the current session.
     * @param secondsBeforeTokenExpirationToCallReminder - The number of seconds before token expiration to
     *  call tokenIsAboutToExpireHandler handler. The handler is called only when the value is positive number
     *  greater than zero and tokenIsAboutToExpireHandler handler value was provided during provider
     *  construction.
     *
     * @throws error is thrown when the method is called before client was initialized, if JWT is empty,
     *  or if JWT is not valid (if "sub" claim does not match the sub of the previous JWT).
     */
    public updateJwt = (
        jwt: string,
        secondsBeforeTokenExpirationToCallReminder: number = DEFAULT_EXPIRATION_REMINDER_IN_SECONDS,
    ): void => {
        validateJwt(jwt, this.jwt);
        this.jwt = jwt;
        this.secondsBeforeTokenExpirationToCallReminder = secondsBeforeTokenExpirationToCallReminder;
        this.updateApiToken(jwt);
        this.startReminder(jwt);
    };

    private startReminder(jwt: string): void {
        if (
            this.tokenIsAboutToExpireHandler === undefined ||
            this.secondsBeforeTokenExpirationToCallReminder <= 0
        ) {
            return;
        }

        // cancel previous reminder if new token was set before the previous token expiration
        clearTimeout(this.expirationReminderId);

        this.expirationReminderId = setTimeout(
            // provide callback for setting a new token value to the expiration handler
            () => this.tokenIsAboutToExpireHandler!((newJwt: string) => this.updateJwt(newJwt)),
            computeExpirationReminderTimeout(
                jwt,
                this.secondsBeforeTokenExpirationToCallReminder,
                Date.now(),
            ),
        );
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
 * @param additionalParams - additional params used in the authentication URL
 * @public
 */
export function createTigerAuthenticationUrl(
    backend: IAnalyticalBackend,
    authenticationFlow: AuthenticationFlow,
    location: Location,
    additionalParams?: {
        externalProviderId?: string;
    },
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

    const baseUrl = `${host}${authenticationFlow.loginUrl}`;

    const params = {
        [authenticationFlow.returnRedirectParam]: returnAddress,
        ...(additionalParams ?? {}),
    };

    const paramsString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");

    return `${baseUrl}?${paramsString}`;
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
export function createTigerDeauthenticationUrl(
    backend: IAnalyticalBackend,
    location: Location,
    returnTo?: string,
): string {
    let host = `${location.protocol}//${location.host}`;
    const { hostname: backendHostname } = backend.config;

    if (backendHostname && backendHostname !== host) {
        // different origin. app must redirect to the backend hostname
        host = backendHostname;
    }

    const returnUrl = returnTo ? `?returnTo=${returnTo}` : "";
    return `${host}/logout${returnUrl}`;
}

/**
 * Type of handler that will redirect the browser to the location where Tiger authentication flow will start.
 *
 * @public
 */
export type RedirectToTigerAuthenticationHandler = (
    context: IAuthenticationContext,
    error: NotAuthenticated,
) => void;

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
        console.error("Analytical Backend did not provide detail where to start authentication flow.");

        return;
    }

    window.location.href = createTigerAuthenticationUrl(
        context.backend,
        error.authenticationFlow,
        window.location,
    );
}

/**
 * Additional params for redirect API call, eg. the external provider ID to be used for authentication
 * @public
 */
export interface IRedirectToTigerAuthenticationParams {
    externalProviderId: string;
}

/**
 * Factory to create a redirectToTigerAuthentication function with a specific params, eg. externalProviderId.
 *
 * @param params - additional params for redirect call, eg. the external provider ID to be used in the authentication URL
 * @returns {@link RedirectToTigerAuthenticationHandler}  - a function that redirects to Tiger authentication with the specified params
 * @public
 */
export function createRedirectToTigerAuthenticationWithParams(
    params: IRedirectToTigerAuthenticationParams,
): RedirectToTigerAuthenticationHandler {
    return function redirectToTigerAuthentication(
        context: IAuthenticationContext,
        error: NotAuthenticated,
    ): void {
        if (!error.authenticationFlow) {
            console.error("Analytical Backend did not provide detail where to start authentication flow.");
            return;
        }

        window.location.href = createTigerAuthenticationUrl(
            context.backend,
            error.authenticationFlow,
            window.location,
            params,
        );
    };
}
