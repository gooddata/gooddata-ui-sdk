// (C) 2020-2021 GoodData Corporation
import { IUser as IModelUser, userFullName as modelUserFullName } from "@gooddata/sdk-model";
import { IUserSettingsService } from "./settings";

/**
 * Represents platform user.
 *
 * @deprecated Use the IUser from \@gooddata/sdk-model
 * @alpha
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUser extends IModelUser {}

/**
 * Gets the user full name
 *
 * @param user - user to get full name of
 * @returns the user full name
 * @deprecated Use the userFullName from \@gooddata/sdk-model
 * @alpha
 */
export function userFullName(user: IUser): string | undefined {
    return modelUserFullName(user);
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
