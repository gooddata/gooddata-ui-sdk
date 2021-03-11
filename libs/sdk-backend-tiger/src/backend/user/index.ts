// (C) 2020-2021 GoodData Corporation
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
        return this.authCall(async (sdk) => {
            const profile = await sdk.axios.get<IUserProfile>("/api/profile");
            return convertUser(profile.data);
        });
    }
}
