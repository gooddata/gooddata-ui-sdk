// (C) 2020-2022 GoodData Corporation
import { IUser, IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { TigerUserSettingsService } from "./settings";
import { TigerAuthenticatedCallGuard } from "../../types";
import { convertUser } from "../../convertors/fromBackend/UsersConverter";

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
