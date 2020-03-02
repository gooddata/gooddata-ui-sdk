// (C) 2020 GoodData Corporation
import { SDK } from "@gooddata/gd-bear-client";
import invariant from "ts-invariant";
import {
    AuthenticationContext,
    AuthenticatedPrincipal,
    NotSupported,
    IAuthenticationProvider,
} from "@gooddata/sdk-backend-spi";

/**
 * This implementation of authentication provider does login with fixed username and password.
 *
 * @public
 */
export class FixedLoginAndPasswordAuthProvider implements IAuthenticationProvider {
    private principal: AuthenticatedPrincipal | undefined;

    constructor(private readonly username: string, private readonly password: string) {}

    public async authenticate(context: AuthenticationContext): Promise<AuthenticatedPrincipal> {
        const sdk = context.client as SDK;

        await sdk.user.login(this.username, this.password);
        await this.obtainCurrentPrincipal(context);

        invariant(this.principal, "Principal must be obtainable after login");

        return this.principal!;
    }

    public async getCurrentPrincipal(
        context: AuthenticationContext,
    ): Promise<AuthenticatedPrincipal | undefined> {
        if (!this.principal) {
            await this.obtainCurrentPrincipal(context);
        }

        return this.principal;
    }

    public async deauthenticate(context: AuthenticationContext): Promise<void> {
        const sdk = context.client as SDK;
        // we do not return the promise to logout as we do not want to return the response
        await sdk.user.logout();
    }

    private async obtainCurrentPrincipal(context: AuthenticationContext): Promise<void> {
        const sdk = context.client as SDK;
        const currentProfile = await sdk.user.getCurrentProfile();

        this.principal = {
            userId: currentProfile.login,
            userMeta: currentProfile,
        };
    }
}

/**
 * @see AuthProviderCallGuard
 * @internal
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
