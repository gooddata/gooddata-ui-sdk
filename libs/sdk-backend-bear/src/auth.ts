// (C) 2020 GoodData Corporation
import { SDK } from "@gooddata/gd-bear-client";
import invariant from "ts-invariant";
import {
    AuthenticationContext,
    AuthenticatedPrincipal,
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
