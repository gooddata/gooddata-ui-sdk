// (C) 2020 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { userLoginMd5FromAuthenticatedPrincipal } from "../../utils/api";
import { BearAuthenticatedCallGuard } from "../../types/auth";

export class BearUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (sdk, { getPrincipal }) => {
            const userLoginMd5 = await userLoginMd5FromAuthenticatedPrincipal(getPrincipal);

            const [flags, currentProfile] = await Promise.all([
                sdk.user.getUserFeatureFlags(userLoginMd5),
                sdk.user.getCurrentProfile(),
            ]);

            const { language } = currentProfile;

            return {
                userId: userLoginMd5,
                locale: language!,
                ...flags,
            };
        });
    }
}
