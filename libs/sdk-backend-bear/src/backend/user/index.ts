// (C) 2020 GoodData Corporation
import { IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { BearUserSettingsService } from "./settings";
import { BearAuthenticatedCallGuard } from "../../types/auth";

export class BearUserService implements IUserService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new BearUserSettingsService(this.authCall);
    }
}
