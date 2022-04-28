// (C) 2007-2022 GoodData Corporation
import qs from "qs";
import { XhrModule, ApiResponseError, ApiResponse } from "./xhr";
import { ProjectModule } from "./project";
import { GdcUser } from "@gooddata/api-model-bear";
import { parseSettingItemValue } from "./util";
import { IFeatureFlags } from "./interfaces";

export interface IUserConfigsSettingItem {
    settingItem: {
        key: string;
        links: {
            self: string;
        };
        source: string;
        value: string;
    };
}

export interface IUserConfigsResponse {
    settings: {
        items: IUserConfigsSettingItem[];
    };
}

export class UserModule {
    constructor(private xhr: XhrModule) {}

    /**
     * Find out whether a user is logged in
     *
     * @returns resolves with true if user logged in, false otherwise
     */
    public async isLoggedIn(): Promise<boolean> {
        try {
            const result = await this.xhr.get("/gdc/account/token");
            return !!result.response.ok;
        } catch (err: any) {
            if (err?.response?.status === 401) {
                return false;
            }
            throw err;
        }
    }

    /**
     * Find out whether a specified project is available to a currently logged user
     *
     * @param projectId - A project identifier
     * @returns Resolves with true if user logged in and project available,
     *                   resolves with false if user logged in and project not available,
     *                   rejects if user not logged in
     */
    public async isLoggedInProject(projectId: string): Promise<boolean> {
        const profile = await this.getCurrentProfile();
        const projectModule = new ProjectModule(this.xhr);
        const projects = await projectModule.getProjects(profile!.links!.self!.split("/")![4]);
        return projects.some((p) => p.links?.self === `/gdc/projects/${projectId}`);
    }

    /**
     * This function provides an authentication entry point to the GD API. It is needed to authenticate
     * by calling this function prior any other API calls. After providing valid credentials
     * every subsequent API call in a current session will be authenticated.
     */
    public login(username: string, password: string): Promise<any> {
        return this.xhr.postParsed("/gdc/account/login", {
            body: JSON.stringify({
                postUserLogin: {
                    login: username,
                    password,
                    remember: 1,
                    captcha: "",
                    verifyCaptcha: "",
                },
            }),
        });
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
        return this.xhr.post("/gdc/account/customerlogin", {
            data: {
                pgpLoginRequest: {
                    targetUrl,
                    ssoProvider,
                    encryptedClaims,
                },
            },
        });
    }

    /**
     * Logs out current user
     */
    public logout(): Promise<ApiResponse | void> {
        return this.isLoggedIn().then(
            (loggedIn: boolean): Promise<ApiResponse | void> => {
                if (loggedIn) {
                    return this.xhr.get("/gdc/app/account/bootstrap").then((result: any) => {
                        const data = result.getData();
                        const userUri = data.bootstrapResource.accountSetting.links.self;
                        const userId = userUri.match(/([^/]+)\/?$/)[1];

                        return this.xhr.del(`/gdc/account/login/${userId}`);
                    });
                }

                return Promise.resolve();
            },
            (err: ApiResponseError) => Promise.reject(err),
        );
    }

    /**
     * Gets current user's profile
     * @returns Resolves with account setting object
     */
    public getCurrentProfile(): Promise<GdcUser.IAccountSetting> {
        return this.xhr.get("/gdc/account/profile/current").then((r) => r.getData().accountSetting);
    }

    /**
     * Gets user's regional number formatting configuration
     * @param userId - loginMD5
     * @returns Resolves with separators setting object
     */
    public getUserRegionalNumberFormatting(userId: string): Promise<GdcUser.ISeparators> {
        return this.xhr
            .getParsed<GdcUser.ISeparatorsResponse>(`/gdc/account/profile/${userId}/settings/separators`)
            .then(
                (res): GdcUser.ISeparators => ({
                    decimal: res.separators.decimal,
                    thousand: res.separators.thousand,
                }),
            );
    }

    /**
     * Updates user's profile settings
     * @param profileId - User profile identifier
     * @param profileSetting - the profile setting update payload
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public updateProfileSettings(profileId: string, profileSetting: any): Promise<ApiResponse> {
        // TODO
        return this.xhr.put(`/gdc/account/profile/${profileId}/settings`, {
            body: profileSetting,
        });
    }

    /**
     * Returns info about currently logged in user from bootstrap resource
     */
    public getAccountInfo(): Promise<{
        login: string;
        loginMD5: string;
        firstName: string;
        lastName: string;
        organizationName: string;
        profileUri: string;
    }> {
        return this.xhr.get("/gdc/app/account/bootstrap").then((result: any) => {
            const { bootstrapResource } = result.getData();
            return {
                login: bootstrapResource.accountSetting.login,
                loginMD5: bootstrapResource.current.loginMD5,
                firstName: bootstrapResource.accountSetting.firstName,
                lastName: bootstrapResource.accountSetting.lastName,
                organizationName: bootstrapResource.settings.organizationName,
                profileUri: bootstrapResource.accountSetting.links.self,
            };
        });
    }

    /**
     * Gets user configs including user specific feature flags
     *
     * @param userId - A user identifier
     * @returns An array of user configs setting item
     */
    public getUserConfigs(userId: string): Promise<IUserConfigsSettingItem[]> {
        return this.xhr.get(`/gdc/account/profile/${userId}/config`).then((apiResponse: ApiResponse) => {
            const userConfigs: IUserConfigsResponse = apiResponse.getData();
            const {
                settings: { items },
            } = userConfigs;

            return items || [];
        });
    }

    /**
     * Gets user specific feature flags
     *
     * @param userId - A user identifier
     * @param sourceFilter - Optional list of setting item sources to include. Defaults to including everything
     * @returns Hash table of feature flags and their values where feature flag is the key
     */
    public getUserFeatureFlags(userId: string, sourceFilter?: string[]): Promise<IFeatureFlags> {
        return this.getUserConfigs(userId).then((settingItems) => {
            const filteredSettingItems = sourceFilter
                ? settingItems.filter((item) => sourceFilter.includes(item.settingItem.source))
                : settingItems;

            const featureFlags: IFeatureFlags = {};
            filteredSettingItems.forEach((settingItem) => {
                featureFlags[settingItem.settingItem.key] = parseSettingItemValue(
                    settingItem.settingItem.value,
                );
            });
            return featureFlags;
        });
    }

    /**
     * Returns the feature flags valid for the currently logged in user.
     */
    public getFeatureFlags(): Promise<GdcUser.IFeatureFlags> {
        return this.xhr
            .get("/gdc/app/account/bootstrap")
            .then((r: any) => r.getData())
            .then((result: any) => result.bootstrapResource.current.featureFlags);
    }

    /**
     * Returns bootstrap resource for the currently logged in user.
     */
    public getBootstrapResource(
        options: { projectId?: string; productId?: string; clientId?: string } = {},
    ): Promise<GdcUser.IBootstrapResource> {
        const { projectId, productId, clientId } = options;
        let uri = "/gdc/app/account/bootstrap";

        if (projectId) {
            uri = `${uri}?projectUri=/gdc/projects/${projectId}`;
        } else if (productId && clientId) {
            // projectId can be replaced by combination of productId + clientId
            uri = `${uri}?projectUri=/gdc/projects/client:${productId}:${clientId}`;
        }

        return this.xhr.getParsed<GdcUser.IBootstrapResource>(uri);
    }

    /**
     * Initiates SPI SAML SSO.
     *
     * @param relayState - URL of the page where the user is redirected after a successful login
     */
    public initiateSamlSso(relayState: string): Promise<void> {
        /*
         * make sure code does not try to get new token before initiating the SAML; the token request would
         * fail and prevent the samlrequest call; there is no point in getting token anyway because it is just
         * now that the client is initializing the session security context.
         */
        this.xhr.ensureNoLeadingTokenRequest();

        return this.xhr
            .get(`/gdc/account/samlrequest?${qs.stringify({ relayState })}`)
            .then((data) => data.getData())
            .then((response) => {
                const loginUrl = response.samlRequests.items[0].samlRequest.loginUrl;
                window.location.assign(loginUrl);
            });
    }
}
