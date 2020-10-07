// (C) 2020 GoodData Corporation
import { SDK } from "@gooddata/api-client-bear";
import invariant from "ts-invariant";
import {
    IAuthenticationContext,
    IAuthenticatedPrincipal,
    IAuthenticationProvider,
    NotAuthenticated,
} from "@gooddata/sdk-backend-spi";

/**
 * Base for other IAuthenticationProvider implementations.
 *
 * @public
 */
export abstract class BearAuthProviderBase implements IAuthenticationProvider {
    protected principal: IAuthenticatedPrincipal | undefined;

    public abstract authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal>;

    public async deauthenticate(context: IAuthenticationContext): Promise<void> {
        const sdk = context.client as SDK;
        // we do not return the promise to logout as we do not want to return the response
        await sdk.user.logout();
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
        const sdk = context.client as SDK;
        const currentProfile = await sdk.user.getCurrentProfile();

        this.principal = {
            userId: currentProfile.login!,
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
    implements IAuthenticationProvider {
    constructor(private readonly username: string, private readonly password: string) {
        super();
    }

    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        const sdk = context.client as SDK;

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
export class ContextDeferredAuthProvider extends BearAuthProviderBase implements IAuthenticationProvider {
    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        const sdk = context.client as SDK;

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
