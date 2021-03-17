// (C) 2020-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IUserSettingsService } from "./settings";
import invariant from "ts-invariant";

/**
 * Represents platform user.
 *
 * @alpha
 */
export interface IUser {
    /**
     * Stored user reference.
     */
    ref: ObjRef;

    /**
     * Login - unique user ID for logging into the platform.
     */
    login: string;

    /**
     * Contact email of the user.
     */
    email?: string;

    /**
     * Full name.
     *
     * Note: This property has higher priority than firstName / lastName.
     * Backend implementation MUST fill this property if user names are supported.
     */
    fullName?: string;

    /**
     * First name - when backend implementations supports it.
     */
    firstName?: string;

    /**
     * Last name - when backend implementations supports it.
     */
    lastName?: string;
}

/**
 * Gets the user full name
 *
 * @param user - user to get full name of
 * @returns the user full name
 * @alpha
 */
export function userFullName(user: IUser): string | undefined {
    invariant(user, "user to get full name of must be specified");

    return user.fullName;
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
