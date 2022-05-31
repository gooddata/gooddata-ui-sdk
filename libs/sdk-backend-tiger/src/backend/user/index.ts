// (C) 2020-2022 GoodData Corporation
import { IUser, IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { TigerUserSettingsService } from "./settings";
import { TigerAuthenticatedCallGuard } from "../../types";
import { convertUser, IUserProfile } from "../../convertors/fromBackend/UsersConverter";

export class TigerUserService implements IUserService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new TigerUserSettingsService(this.authCall);
    }

    public async getUser(): Promise<IUser> {
        // TODO: replace with direct call of TigerClient (once methods are generated from OpenAPI)
        return this.authCall(async (client) => {
            const profile = await client.axios.get<IUserProfile>("/api/v1/profile");
            return convertUser(profile.data);
        });
    }
}
