// (C) 2020-2022 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";
import { IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { TigerUserSettingsService } from "./settings.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { convertUser } from "../../convertors/fromBackend/UsersConverter.js";

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
}
