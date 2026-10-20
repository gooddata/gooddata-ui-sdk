// (C) 2020-2026 GoodData Corporation

import { type IUser } from "@gooddata/sdk-model";

import { type IUserApiTokensService } from "./apiTokens/index.js";
import { type IUserSettingsService } from "./settings/index.js";

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

    /**
     * Returns currently authenticated user with details
     */
    getUserWithDetails(): Promise<IUser>;

    /**
     * Returns service that can be used to manage API tokens of the user.
     *
     * @alpha
     */
    apiTokens(): IUserApiTokensService;
}
