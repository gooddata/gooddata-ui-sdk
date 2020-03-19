// (C) 2020 GoodData Corporation
import invariant from "ts-invariant";
import { NotAuthenticated } from "@gooddata/sdk-backend-spi";
import { BearAuthenticationProvider, BearAuthenticatedPrincipal, BearAuthenticationContext } from "./types";

/**
 * Base for other IAuthenticationProvider implementations.
 *
 * @public
 */
export abstract class BearAuthProviderBase implements BearAuthenticationProvider {
    protected principal: BearAuthenticatedPrincipal | undefined;

    public abstract authenticate(context: BearAuthenticationContext): Promise<BearAuthenticatedPrincipal>;

    public async deauthenticate(context: BearAuthenticationContext): Promise<void> {
        const sdk = context.client;
        // we do not return the promise to logout as we do not want to return the response
        await sdk.user.logout();
    }

    public async getCurrentPrincipal(
        context: BearAuthenticationContext,
    ): Promise<BearAuthenticatedPrincipal | undefined> {
        if (!this.principal) {
            await this.obtainCurrentPrincipal(context);
        }

        return this.principal;
    }

    protected async obtainCurrentPrincipal(context: BearAuthenticationContext): Promise<void> {
        const sdk = context.client;
        const currentProfile = await sdk.user.getCurrentProfile();

        this.principal = {
            userId: currentProfile.login,
            userMeta: currentProfile,
        };
    }
}

/**
 * This implementation of authentication provider does login with fixed username and password.
 *
 * @public
 */
export class FixedLoginAndPasswordAuthProvider extends BearAuthProviderBase
    implements BearAuthenticationProvider {
    constructor(private readonly username: string, private readonly password: string) {
        super();
    }

    public async authenticate(context: BearAuthenticationContext): Promise<BearAuthenticatedPrincipal> {
        const sdk = context.client;

        await sdk.user.login(this.username, this.password);
        await this.obtainCurrentPrincipal(context);

        invariant(this.principal, "Principal must be obtainable after login");

        return this.principal!;
    }
}

/**
 * This implementation of authentication provider expects that the authentication is provided externally.
 * It cannot perform the login itself.
 *
 * @public
 */
export class ContextDeferredAuthProvider extends BearAuthProviderBase implements BearAuthenticationProvider {
    public async authenticate(context: BearAuthenticationContext): Promise<BearAuthenticatedPrincipal> {
        const sdk = context.client;

        // check if the user is logged in, implicitly triggering token renewal in case it is needed
        const isLoggedIn = await sdk.user.isLoggedIn();
        if (!isLoggedIn) {
            throw new NotAuthenticated(
                "Please make sure the context is already authenticated when using ContextDeferredAuthProvider",
            );
        }

        await this.obtainCurrentPrincipal(context);

        invariant(this.principal, "Principal must be obtainable after login");

        return this.principal!;
    }
}
