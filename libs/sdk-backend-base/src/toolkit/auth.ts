// (C) 2019-2025 GoodData Corporation
import {
    IAuthenticatedPrincipal,
    IAuthenticationContext,
    ErrorConverter,
    IAuthenticationProvider,
    NotSupported,
    NotAuthenticated,
} from "@gooddata/sdk-backend-spi";

/**
 * Authenticated async call context
 *
 * @beta
 */
export interface IAuthenticatedAsyncCallContext {
    /**
     * Returns the currently authenticated principal.
     * Calling this function MAY trigger the authentication flow in case the current session
     * is not yet authenticated and the principal is unknown.
     * If the authentication flow fails, the NotAuthenticated error is thrown.
     */
    getPrincipal(): Promise<IAuthenticatedPrincipal>;
}

/**
 * Authenticated async call
 *
 * @beta
 */
export type AuthenticatedAsyncCall<TSdk, TReturn> = (
    sdk: TSdk,
    context: IAuthenticatedAsyncCallContext,
) => Promise<TReturn>;

/**
 * Authenticated call guard
 *
 * @beta
 */
export type AuthenticatedCallGuard<TSdk = any> = <TReturn>(
    call: AuthenticatedAsyncCall<TSdk, TReturn>,
    errorConverter?: ErrorConverter,
) => Promise<TReturn>;

/**
 * see AuthProviderCallGuard
 * @public
 */
export interface IAuthProviderCallGuard extends IAuthenticationProvider {
    reset(): void;
}

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
    private inflightRequest: Promise<IAuthenticatedPrincipal> | undefined;
    private principal: IAuthenticatedPrincipal | undefined;
    public disablePrincipalCache: boolean;

    constructor(private readonly realProvider: IAuthenticationProvider) {
        this.disablePrincipalCache = realProvider.disablePrincipalCache;
    }

    public reset = (): void => {
        this.principal = undefined;
    };

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public initializeClient = (client: any): void => {
        this.realProvider.initializeClient?.(client);
    };

    public onNotAuthenticated = (context: IAuthenticationContext, error: NotAuthenticated): void => {
        this.realProvider.onNotAuthenticated?.(context, error);
    };

    public authenticate = (context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> => {
        if (this.principal && !this.disablePrincipalCache) {
            return Promise.resolve(this.principal);
        }

        if (this.inflightRequest) {
            return this.inflightRequest;
        }

        this.inflightRequest = this.realProvider
            .authenticate(context)
            .then((res) => {
                this.principal = this.disablePrincipalCache ? undefined : res;
                this.inflightRequest = undefined;

                return res;
            })
            .catch((err) => {
                this.inflightRequest = undefined;

                throw err;
            });

        return this.inflightRequest;
    };

    public getCurrentPrincipal(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null> {
        return this.realProvider.getCurrentPrincipal(context);
    }

    public async deauthenticate(context: IAuthenticationContext, returnTo?: string): Promise<void> {
        return this.realProvider.deauthenticate(context, returnTo);
    }
}

/**
 * This implementation serves as a Null object for IAuthProviderCallGuard.
 *
 * @internal
 */
export class NoopAuthProvider implements IAuthProviderCallGuard {
    public disablePrincipalCache = false;

    public authenticate(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        throw new NotSupported("NoopAuthProvider does not support authenticate");
    }

    public getCurrentPrincipal(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null> {
        throw new NotSupported("NoopAuthProvider does not support getCurrentPrincipal");
    }

    public deauthenticate(_context: IAuthenticationContext): Promise<void> {
        throw new NotSupported("NoopAuthProvider does not support deauthenticate");
    }

    public reset(): void {
        throw new NotSupported("NoopAuthProvider does not support reset");
    }
}

export const AnonymousUser: IAuthenticatedPrincipal = {
    userId: "anonymous",
};

/**
 * This is a noop implementation of authentication provider - it does nothing and assumes anonymous user.
 *
 * @public
 */
export class AnonymousAuthProvider implements IAuthProviderCallGuard {
    public disablePrincipalCache = false;

    public authenticate(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        return Promise.resolve(AnonymousUser);
    }

    public getCurrentPrincipal(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null> {
        return Promise.resolve(AnonymousUser);
    }

    public deauthenticate(_context: IAuthenticationContext): Promise<void> {
        return Promise.resolve();
    }

    public reset(): void {
        return;
    }
}
