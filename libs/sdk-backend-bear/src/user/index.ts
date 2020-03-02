// (C) 2020 GoodData Corporation
import { IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { AuthenticatedCallGuard } from "../commonTypes";
import { BearUserSettingsService } from "./settings";

export class BearUserService implements IUserService {
    constructor(private readonly authCall: AuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new BearUserSettingsService(this.authCall);
    }
}
