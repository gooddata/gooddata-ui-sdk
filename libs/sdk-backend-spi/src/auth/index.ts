// (C) 2019-2020 GoodData Corporation
import { ErrorConverter, NotSupported } from "../errors";

/**
 * Defines authentication provider to use when instance of IAnalyticalBackend discovers that
 * the current session is not authenticated.
 *
 * @public
 */
export interface IAuthenticationProvider<TClient = any, TUser = any> {
    /**
     * Perform authentication.
     *
     * @param context - context in which the authentication is done
     * @returns promise with currently authenticated principal
     */
    authenticate(context: AuthenticationContext<TClient>): Promise<AuthenticatedPrincipal<TUser>>;

    /**
     * Returns the currently authenticated principal, or undefined if not authenticated.
     * Does not trigger authentication if no principal is available.
     *
     * @param context - context in which the authentication is done
     * @returns promise with currently authenticated principal, or undefined if user is not authenticated
     */
    getCurrentPrincipal(
        context: AuthenticationContext<TClient>,
    ): Promise<AuthenticatedPrincipal<TUser> | undefined>;

    /**
     * Clear existing authentication.
     *
     * @param context - context in which the authentication is done
     * @returns promise
     */
    deauthenticate(context: AuthenticationContext<TClient>): Promise<void>;
}

/**
 * Describes context in which the authentication is done. To cater for custom authentication schemes.
 * the API client of the underlying backend IS exposed anonymously to the provider - the provider SHOULD use
 * the provided API client to exercise any backend-specific authentication mechanisms.
 *
 * @public
 */
export type AuthenticationContext<TClient> = {
    /**
     * API client used to communicate with the backend - this can be used to perform any backend-specific,
     * non-standard authentication.
     */
    client: TClient;
};

/**
 * Describes user, which is currently authenticated to the backend.
 *
 * @public
 */
export type AuthenticatedPrincipal<TUser = any> = {
    /**
     * Unique identifier of the authenticated user. The identifier semantics MAY differ between backend
     * implementations. The client code SHOULD NOT make assumptions on the content (such as userId being
     * valid email and so on).
     */
    userId: string;

    /**
     * Backend-specific user metadata.
     */
    userMeta?: TUser;
};

/**
 * Authenticated async call context
 *
 * @public
 */
export interface IAuthenticatedAsyncCallContext<TUser> {
    principal: AuthenticatedPrincipal<TUser>;
}

/**
 * Authenticated async call
 *
 * @public
 */
export type AuthenticatedAsyncCall<TClient, TUser, TReturn> = (
    sdk: TClient,
    context: IAuthenticatedAsyncCallContext<TUser>,
) => Promise<TReturn>;

/**
 * Authenticated call guard
 *
 * @public
 */
export type AuthenticatedCallGuard<TClient, TUser> = <TReturn>(
    call: AuthenticatedAsyncCall<TClient, TUser, TReturn>,
    errorConverter?: ErrorConverter,
) => Promise<TReturn>;

/**
 * see AuthProviderCallGuard
 * @internal
 */
export interface IAuthProviderCallGuard<TClient, TUser> extends IAuthenticationProvider<TClient, TUser> {
    /**
     * Reset current principal
     */
    reset(): void;
}

//
// Supporting / convenience functions
//

/**
 * This implementation of auth provider ensures, that the auth provider is called exactly once in the happy path
 * execution where provider successfully authenticates a principal.
 *
 * If underlying provider fails, subsequent calls that need authentication will land in the provider.
 *
 * This class encapsulates the stateful nature of interaction of the provider across multiple different instances
 * of the bear backend, all of which are set with the same provider. All instances of the backend should be
 * subject to the same authentication flow AND the call to the authentication provider should be synchronized
 * through this scoped instance.
 *
 * @internal
 */
export class AuthProviderCallGuard<TClient, TUser> implements IAuthProviderCallGuard<TClient, TUser> {
    private inflightRequest: Promise<AuthenticatedPrincipal<TUser>> | undefined;
    private principal: AuthenticatedPrincipal<TUser> | undefined;

    constructor(private readonly realProvider: IAuthenticationProvider<TClient, TUser>) {}

    public reset = (): void => {
        this.principal = undefined;
    };

    public authenticate = (
        context: AuthenticationContext<TClient>,
    ): Promise<AuthenticatedPrincipal<TUser>> => {
        if (this.principal) {
            return Promise.resolve(this.principal);
        }

        if (this.inflightRequest) {
            return this.inflightRequest;
        }

        this.inflightRequest = this.realProvider
            .authenticate(context)
            .then(res => {
                this.principal = res;
                this.inflightRequest = undefined;

                return res;
            })
            .catch(err => {
                this.inflightRequest = undefined;

                throw err;
            });

        return this.inflightRequest;
    };

    public getCurrentPrincipal(
        context: AuthenticationContext<TClient>,
    ): Promise<AuthenticatedPrincipal<TUser> | undefined> {
        return this.realProvider.getCurrentPrincipal(context);
    }

    public async deauthenticate(context: AuthenticationContext<TClient>): Promise<void> {
        return this.realProvider.deauthenticate(context);
    }
}

/**
 * This implementation serves as a Null object for IAuthProviderCallGuard.
 *
 * @internal
 */
export class NoopAuthProvider<TClient, TUser> implements IAuthProviderCallGuard<TClient, TUser> {
    public authenticate(_context: AuthenticationContext<TClient>): Promise<AuthenticatedPrincipal<TUser>> {
        throw new NotSupported("NoopAuthProvider does not support authenticate");
    }

    public getCurrentPrincipal(
        _context: AuthenticationContext<TClient>,
    ): Promise<AuthenticatedPrincipal<TUser> | undefined> {
        throw new NotSupported("NoopAuthProvider does not support getCurrentPrincipal");
    }

    public deauthenticate(_context: AuthenticationContext<TClient>): Promise<void> {
        throw new NotSupported("NoopAuthProvider does not support deauthenticate");
    }

    public reset(): void {
        throw new NotSupported("NoopAuthProvider does not support reset");
    }
}
