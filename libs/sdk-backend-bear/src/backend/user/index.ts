// (C) 2020-2022 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";
import { IUserService, IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { BearUserSettingsService } from "./settings.js";
import { BearAuthenticatedCallGuard } from "../../types/auth.js";
import { convertUser } from "../../convertors/fromBackend/UsersConverter.js";

export class BearUserService implements IUserService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard) {}

    public settings(): IUserSettingsService {
        return new BearUserSettingsService(this.authCall);
    }

    public getUser(): Promise<IUser> {
        return this.authCall(async (sdk) => {
            const accountSettings = await sdk.user.getCurrentProfile();
            return convertUser(accountSettings);
        });
    }
}
