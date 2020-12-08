// (C) 2020 GoodData Corporation
import { IUser, IUserService, IUserSettingsService, NotSupported } from "@gooddata/sdk-backend-spi";
import { TigerUserSettingsService } from "./settings";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerUserService implements IUserService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new TigerUserSettingsService(this.authCall);
    }

    public async getUser(): Promise<IUser> {
        throw new NotSupported("not supported");
    }
}
