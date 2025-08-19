// (C) 2020-2025 GoodData Corporation
import { IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { IUser } from "@gooddata/sdk-model";

import { TigerUserSettingsService } from "./settings.js";
import { convertUser } from "../../convertors/fromBackend/UsersConverter.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerUserService implements IUserService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new TigerUserSettingsService(this.authCall);
    }

    public async getUser(): Promise<IUser> {
        return this.authCall(async (client) => {
            return convertUser(await client.profile.getCurrent());
        });
    }

    public async getUserWithDetails(): Promise<IUser> {
        return this.authCall(async (client) => {
            return convertUser(await client.profile.getCurrentWithDetails());
        });
    }
}
