// (C) 2020-2025 GoodData Corporation
import { ProfileApi_GetCurrent, ProfileApi_GetCurrentWithDetails } from "@gooddata/api-client-tiger/profile";
import { type IUserService, type IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { type IUser } from "@gooddata/sdk-model";

import { TigerUserSettingsService } from "./settings.js";
import { convertUser } from "../../convertors/fromBackend/UsersConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerUserService implements IUserService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new TigerUserSettingsService(this.authCall);
    }

    public async getUser(): Promise<IUser> {
        return this.authCall(async (client) => {
            return convertUser(await ProfileApi_GetCurrent(client.axios));
        });
    }

    public async getUserWithDetails(): Promise<IUser> {
        return this.authCall(async (client) => {
            return convertUser(await ProfileApi_GetCurrentWithDetails(client.axios));
        });
    }
}
