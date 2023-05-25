// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceSettings,
    IWorkspaceSettingsService,
    IUserWorkspaceSettings,
    NotSupported,
} from "@gooddata/sdk-backend-spi";
import { ISettings } from "@gooddata/sdk-model";
import { IFeatureFlags } from "@gooddata/api-client-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { userLoginMd5FromAuthenticatedPrincipalWithAnonymous } from "../../../utils/api.js";
import { ANONYMOUS_USER_SETTINGS } from "../../constants.js";

// settings which are ignored from user level as they can be set up only for project and above levels
// no explicit type as every string is valid key from IUserWorkspaceSettings
const IGNORED_USER_SETTINGS = [
    "enableAnalyticalDashboardPermissions",
    "enableNewAnalyticalDashboardsNavigation",
];

const filterIgnoredUserSettings = (userFeatureFlags: IFeatureFlags) => {
    const keptUserSettings = { ...userFeatureFlags };
    for (const settingName of IGNORED_USER_SETTINGS) {
        delete keptUserSettings[settingName];
    }
    return keptUserSettings;
};

export const mergeWorkspaceAndUserSettings = (
    workspaceFeatureFlags: IFeatureFlags,
    userFeatureFlags: IFeatureFlags,
): ISettings => {
    return {
        // the order is important here, user configs with the "user" source should override the workspace settings
        ...workspaceFeatureFlags,
        ...filterIgnoredUserSettings(userFeatureFlags),
    };
};

export class BearWorkspaceSettings implements IWorkspaceSettingsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getSettings(): Promise<IWorkspaceSettings> {
        return this.authCall(async (sdk) => {
            const flags = await sdk.project.getProjectFeatureFlags(this.workspace);

            return {
                workspace: this.workspace,
                ...flags,
            };
        });
    }

    public getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.authCall(async (sdk, { getPrincipal }) => {
            const userLoginMd5 = await userLoginMd5FromAuthenticatedPrincipalWithAnonymous(getPrincipal);

            // for anonymous users, return defaults with just the workspace settings
            if (!userLoginMd5) {
                const workspaceSettings = await this.getSettings();
                return {
                    // the order is important here, we want workspace settings to overwrite anonymous user settings
                    ...ANONYMOUS_USER_SETTINGS,
                    ...workspaceSettings,
                };
            }

            const [workspaceFeatureFlags, userFeatureFlags, currentProfile, separators] = await Promise.all([
                sdk.project.getProjectFeatureFlags(this.workspace),
                // the getUserFeatureFlags returns all the feature flags (including the defaults)
                // so we have to filter only the user specific values so as not to use defaults everywhere
                sdk.user.getUserFeatureFlags(userLoginMd5, ["user"]),
                sdk.user.getCurrentProfile(),
                sdk.user.getUserRegionalNumberFormatting(userLoginMd5),
            ]);

            const { language } = currentProfile;
            return {
                userId: userLoginMd5,
                workspace: this.workspace,
                locale: language!,
                separators: separators,
                ...mergeWorkspaceAndUserSettings(workspaceFeatureFlags, userFeatureFlags),
            };
        });
    }

    public setLocale(_locale: string): Promise<void> {
        throw new NotSupported("Backend does not support workspace locale setup");
    }
}
