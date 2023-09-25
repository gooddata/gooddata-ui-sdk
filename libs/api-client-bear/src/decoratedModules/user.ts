// (C) 2023 GoodData Corporation
import {
    IAccountInfo,
    IAccountSetting,
    IBootstrapResource,
    IFeatureFlags,
    IOrganization,
    ISeparators,
} from "@gooddata/api-model-bear";

import { IUserConfigsSettingItem, UserModule, IUserModule } from "../user.js";
import { ApiResponse } from "../xhr.js";

export class UserModuleDecorator implements IUserModule {
    private decorated: UserModule;

    constructor(decorated: UserModule) {
        this.decorated = decorated;
    }

    public async isLoggedIn(): Promise<boolean> {
        return this.decorated.isLoggedIn();
    }

    public async isLoggedInProject(projectId: string): Promise<boolean> {
        return this.decorated.isLoggedInProject(projectId);
    }

    public login(username: string, password: string): Promise<any> {
        return this.decorated.login(username, password);
    }

    public loginSso(
        encryptedClaims: string,
        ssoProvider: string,
        targetUrl: string,
    ): Promise<ApiResponse<any>> {
        return this.decorated.loginSso(encryptedClaims, ssoProvider, targetUrl);
    }

    public async logout(): Promise<ApiResponse | void> {
        return this.decorated.logout();
    }

    public getCurrentProfile(): Promise<IAccountSetting> {
        return this.decorated.getCurrentProfile();
    }

    public getUserRegionalNumberFormatting(userId: string): Promise<ISeparators> {
        return this.decorated.getUserRegionalNumberFormatting(userId);
    }

    public updateProfileSettings(profileId: string, profileSetting: any): Promise<ApiResponse> {
        return this.decorated.updateProfileSettings(profileId, profileSetting);
    }

    public async getAccountInfo(): Promise<IAccountInfo> {
        return this.decorated.getAccountInfo();
    }

    public async getUserConfigs(userId: string): Promise<IUserConfigsSettingItem[]> {
        return this.decorated.getUserConfigs(userId);
    }

    public getUserFeatureFlags(userId: string, sourceFilter?: string[]): Promise<IFeatureFlags> {
        return this.decorated.getUserFeatureFlags(userId, sourceFilter);
    }

    public async getFeatureFlags(): Promise<IFeatureFlags> {
        return this.decorated.getFeatureFlags();
    }

    public async getCurrentOrganization(): Promise<IOrganization> {
        return this.decorated.getCurrentOrganization();
    }

    public getBootstrapResource(
        options: {
            projectId?: string;
            productId?: string;
            clientId?: string;
            loadAnalyticalDashboards?: boolean;
        } = {},
    ): Promise<IBootstrapResource> {
        return this.decorated.getBootstrapResource(options);
    }

    public initiateSamlSso(relayState: string): Promise<void> {
        return this.decorated.initiateSamlSso(relayState);
    }
}
