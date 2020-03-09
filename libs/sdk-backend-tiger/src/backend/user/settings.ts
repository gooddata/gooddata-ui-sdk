// (C) 2020 GoodData Corporation
import { IUserSettingsService, IUserSettings } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../types";

export class TigerUserSettingsService implements IUserSettingsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async query(): Promise<IUserSettings> {
        return this.authCall(async () => {
            return {
                userId: "dummy",
            };
        });
    }
}
