// (C) 2020-2021 GoodData Corporation
import { IUser } from "@gooddata/sdk-model";
import { IUserSettingsService } from "./settings/index.js";

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

    /**
     * Returns currently authenticated user
     */
    getUser(): Promise<IUser>;
}
