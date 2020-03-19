// (C) 2020 GoodData Corporation
import { IUserSettingsService } from "./settings";

/**
 * Represents a user. It is an entry point to various services that can be used to inspect and modify the user.
 *
 * @public
 */
export interface IUserService {
    /**
     * Returns service that can be used to obtain settings that are currently in effect for the user.
     *
     * @returns user settings service
     */
    settings(): IUserSettingsService;
}
