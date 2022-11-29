// (C) 2020-2022 GoodData Corporation
import { SDK } from "@gooddata/api-client-bear";
import invariant from "ts-invariant";
import {
    IAuthenticationContext,
    IAuthenticatedPrincipal,
    IAuthenticationProvider,
    NotAuthenticated,
    NotAuthenticatedHandler,
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
export class FixedLoginAndPasswordAuthProvider
    extends BearAuthProviderBase
    implements IAuthenticationProvider
{
    constructor(private readonly username: string, private readonly password: string) {
        super();
    }

    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        const sdk = context.client as SDK;

        await sdk.user.login(this.username, this.password);
        await this.obtainCurrentPrincipal(context);

        invariant(this.principal, "Principal must be obtainable after login");

        return this.principal;
    }
}

/**
 * This implementation of authentication provider defers the responsibility for performing authentication
 * to the context in which it exists.
 *
 * @remarks
 * In other words it expects that the application will take care of driving
 * the authentication and creating a correct session in which the Bear backend can make authenticated calls.
 *
 * You may use the provider's ability to use passed `NotAuthenticatedHandler` function. This will be called
 * every time a NotAuthenticated error is raised by the backend. Your application can pass a custom handler of
 * this event - typically something that will start driving the authentication from a single place.
 *
 * Note: the not authenticated handler MAY be called many times in succession so you may want to wrap it in a
 * call guard or in a debounce.
 *
 * @public
 */
export class ContextDeferredAuthProvider extends BearAuthProviderBase implements IAuthenticationProvider {
    public constructor(private readonly notAuthenticatedHandler?: NotAuthenticatedHandler) {
        super();
    }

    public onNotAuthenticated = (context: IAuthenticationContext, error: NotAuthenticated): void => {
        this.notAuthenticatedHandler?.(context, error);
    };

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

const AnonymousUser: IAuthenticatedPrincipal = {
    userId: "anonymous",
};

/**
 * This is a noop implementation of bear authentication provider - it does nothing and assumes anonymous user.
 *
 * @public
 */
export class AnonymousAuthProvider implements IAuthenticationProvider {
    public async authenticate(context: IAuthenticationContext): Promise<IAuthenticatedPrincipal> {
        const user = await (context.client as SDK).user.getCurrentProfile();

        return Promise.resolve({
            ...AnonymousUser,
            userMeta: {
                links: {
                    // we need the actual self link of the user from the proxy, this is needed by some of the API calls
                    self: user.links?.self,
                },
            },
        });
    }

    public getCurrentPrincipal(_context: IAuthenticationContext): Promise<IAuthenticatedPrincipal | null> {
        return Promise.resolve(null);
    }

    public deauthenticate(_context: IAuthenticationContext): Promise<void> {
        return Promise.resolve();
    }

    public reset(): void {
        return;
    }
}
