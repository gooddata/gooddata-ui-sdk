// (C) 2019-2020 GoodData Corporation
import { ErrorConverter, NotSupported } from "../errors";

/**
 * Defines authentication provider to use when instance of IAnalyticalBackend discovers that
 * the current session is not authentication.
 *
 * @public
 */
export interface IAuthenticationProvider {
    /**
     * Perform authentication.
     *
     * @param context - context in which the authentication is done
     */
    authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal>;

    /**
     * Returns the currently authenticated principal, or undefined if not authenticated.
     * Does not trigger authentication if no principal is available.
     */
    getCurrentPrincipal(context: AuthenticationContext): Promise<AuthenticatedPrincipal | undefined>;

    /**
     * Clear existing authentication.
     *
     * @param context - context in which the authentication is done
     */
    deauthenticate(context: AuthenticationContext): Promise<void>;
}

/**
 * Describes context in which the authentication is done. To cater for custom authentication schemes.
 * the API client of the underlying backend IS exposed anonymously to the provider - the provider SHOULD use
 * the provided API client to exercise any backend-specific authentication mechanisms.
 *
 * @public
 */
export type AuthenticationContext = {
    /**
     * API client used to communicate with the backend - this can be used to perform any backend-specific,
     * non-standard authentication.
     */
    client: any;
};

/**
 * Describes user, which is currently authenticated to the backend.
 *
 * @public
 */
export type AuthenticatedPrincipal = {
    /**
     * Unique identifier of the authenticated user. The identifier semantics MAY differ between backend
     * implementations. The client code SHOULD NOT make assumptions on the content (such as userId being
     * valid email and so on).
     */
    userId: string;

    /**
     * Backend-specific user metadata.
     */
    userMeta?: any;
};

/**
 * Authenticated async call context
 *
 * @public
 */
export interface IAuthenticatedAsyncCallContext {
    principal: AuthenticatedPrincipal;
}

/**
 * Authenticated async call
 *
 * @public
 */
export type AuthenticatedAsyncCall<TSdk, TReturn> = (
    sdk: TSdk,
    context: IAuthenticatedAsyncCallContext,
) => Promise<TReturn>;

/**
 * Authenticated call guard
 *
 * @public
 */
export type AuthenticatedCallGuard<TSdk = any> = <TReturn>(
    call: AuthenticatedAsyncCall<TSdk, TReturn>,
    errorConverter?: ErrorConverter,
) => Promise<TReturn>;

/**
 * see AuthProviderCallGuard
 * @internal
 */
export interface IAuthProviderCallGuard extends IAuthenticationProvider {
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
export class AuthProviderCallGuard implements IAuthProviderCallGuard {
    private inflightRequest: Promise<AuthenticatedPrincipal> | undefined;
    private principal: AuthenticatedPrincipal | undefined;

    constructor(private readonly realProvider: IAuthenticationProvider) {}

    public reset = (): void => {
        this.principal = undefined;
    };

    public authenticate = (context: AuthenticationContext): Promise<AuthenticatedPrincipal> => {
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

    public getCurrentPrincipal(context: AuthenticationContext): Promise<AuthenticatedPrincipal | undefined> {
        return this.realProvider.getCurrentPrincipal(context);
    }

    public async deauthenticate(context: AuthenticationContext): Promise<void> {
        return this.realProvider.deauthenticate(context);
    }
}

/**
 * This implementation serves as a Null object for IAuthProviderCallGuard.
 *
 * @internal
 */
export class NoopAuthProvider implements IAuthProviderCallGuard {
    public authenticate(_context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        throw new NotSupported("NoopAuthProvider does not support authenticate");
    }

    public getCurrentPrincipal(_context: AuthenticationContext): Promise<AuthenticatedPrincipal | undefined> {
        throw new NotSupported("NoopAuthProvider does not support getCurrentPrincipal");
    }

    public deauthenticate(_context: AuthenticationContext): Promise<void> {
        throw new NotSupported("NoopAuthProvider does not support deauthenticate");
    }

    public reset(): void {
        throw new NotSupported("NoopAuthProvider does not support reset");
    }
}
