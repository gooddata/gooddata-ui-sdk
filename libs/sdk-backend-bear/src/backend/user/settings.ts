// (C) 2020-2022 GoodData Corporation
import { IUserSettingsService, IUserSettings, NotSupported } from "@gooddata/sdk-backend-spi";
import { userLoginMd5FromAuthenticatedPrincipalWithAnonymous } from "../../utils/api.js";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import { ANONYMOUS_USER_SETTINGS } from "../constants.js";

export class BearUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (sdk, { getPrincipal }) => {
            const userLoginMd5 = await userLoginMd5FromAuthenticatedPrincipalWithAnonymous(getPrincipal);

            // for anonymous users, return defaults
            if (!userLoginMd5) {
                return ANONYMOUS_USER_SETTINGS;
            }

            const [flags, currentProfile, separators] = await Promise.all([
                sdk.user.getUserFeatureFlags(userLoginMd5),
                sdk.user.getCurrentProfile(),
                sdk.user.getUserRegionalNumberFormatting(userLoginMd5),
            ]);

            const { language } = currentProfile;

            return {
                userId: userLoginMd5,
                locale: language!,
                separators,
                ...flags,
            };
        });
    }

    public setLocale(_locale: string): Promise<void> {
        throw new NotSupported("Backend does not support user locale setup");
    }
}
