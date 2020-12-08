// (C) 2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IUserSettingsService } from "./settings";

/**
 * Represents platform user
 *
 * @alpha
 */
export interface IUser {
    /**
     * Stored user reference
     */
    ref: ObjRef;

    /**
     * Login - unique user ID for logging into the platform
     */
    login: string;

    /**
     * Contact email of the user
     */
    email?: string;

    /**
     * First name
     */
    firstName?: string;

    /**
     * Last name
     */
    lastName?: string;
}

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
