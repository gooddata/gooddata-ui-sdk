// (C) 2020-2021 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";
import { DefaultUserSettings } from "../uiSettings";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getSettings(): Promise<IUserSettings> {
        return this.authCall(async (_client, ctx) => {
            const principal = await ctx.getPrincipal();
            const settings: IUserSettings = {
                ...DefaultUserSettings,
                userId: principal.userId,
            };

            return settings;
        });
    }
}
