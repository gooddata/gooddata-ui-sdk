// (C) 2020-2022 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";
import { TigerFeaturesService } from "../features";
import { DefaultUserSettings } from "../uiSettings";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (client) => {
            const profile = await client.profile.getCurrent();
            const features = await new TigerFeaturesService(this.authCall).getFeatures(profile);
            return {
                ...DefaultUserSettings,
                ...features,
                userId: profile.userId,
            };
        });
    }
}
