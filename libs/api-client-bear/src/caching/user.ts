// (C) 2022 GoodData Corporation
import { UserModule } from "../user.js";
import { IAccountSetting } from "@gooddata/api-model-bear";
import { CachingContext } from "./cachingClient.js";
import { ApiResponse } from "../xhr.js";
import { UserModuleDecorator } from "../decoratedModules/user.js";

export class UserModuleWithCaching extends UserModuleDecorator {
    constructor(decorated: UserModule, private readonly ctx: CachingContext) {
        super(decorated);
    }

    /**
     * This function provides an authentication entry point to the GD API. It is needed to authenticate
     * by calling this function prior any other API calls. After providing valid credentials
     * every subsequent API call in a current session will be authenticated.
     */
    public login(username: string, password: string): Promise<any> {
        this.ctx.caches.currentProfile = null;
        return super.login(username, password);
    }

    /**
     * This function provides an authentication entry point to the GD API via SSO
     * https://help.gooddata.com/display/developer/GoodData+PGP+Single+Sign-On
     *
     * @param encryptedClaims - PGP message
     * @param ssoProvider - name of the SSO provider
     * @param targetUrl - where to redirect after the SSO flow, set this to `/gdc/account/token`
     */
    public loginSso(
        encryptedClaims: string,
        ssoProvider: string,
        targetUrl: string,
    ): Promise<ApiResponse<any>> {
        this.ctx.caches.currentProfile = null;
        return super.loginSso(encryptedClaims, ssoProvider, targetUrl);
    }

    /**
     * Logs out current user
     */
    public async logout(): Promise<ApiResponse | void> {
        this.ctx.caches.currentProfile = null;
        super.logout();
    }

    /**
     * Gets current user's profile
     * Uses caching to prevent multiple calls.
     * Cache is discarded during logout or next login.
     * @returns Resolves with account setting object
     */
    public getCurrentProfile(): Promise<IAccountSetting> {
        if (this.ctx.caches.currentProfile) {
            return this.ctx.caches.currentProfile;
        }
        const promise = super.getCurrentProfile();
        this.ctx.caches.currentProfile = promise;
        return promise;
    }

    /**
     * Updates user's profile settings
     * @param profileId - User profile identifier
     * @param profileSetting - the profile setting update payload
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public updateProfileSettings(profileId: string, profileSetting: any): Promise<ApiResponse> {
        this.ctx.caches.currentProfile = null;
        return super.updateProfileSettings(profileId, profileSetting);
    }
}

/**
 * @alpha
 */
export type UserModuleDecoratorFactory = (user: UserModule) => UserModule;

export function cachedUser(ctx: CachingContext): UserModuleDecoratorFactory {
    return (original: UserModule) => new UserModuleWithCaching(original, ctx) as unknown as UserModule;
}
