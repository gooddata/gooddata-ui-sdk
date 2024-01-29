// (C) 2023-2024 GoodData Corporation

import { IUser, IUserGroup, IOrganizationUser, IOrganizationUserGroup } from "@gooddata/sdk-model";

/**
 * This service provides access to organization users.
 *
 * @alpha
 */
export interface IOrganizationUserService {
    /**
     * Get user by ID.
     *
     * @param id - ID of the user.
     *
     * @returns promise
     */
    getUser(id: string): Promise<IUser | undefined>;

    /**
     * Creates a new user.
     *
     * @param user - user to create
     */
    createUser(user: IUser): Promise<IUser>;

    /**
     * Get user group by ID.
     *
     * @param id - ID of the user group.
     *
     * @returns promise
     */
    getUserGroup(id: string): Promise<IUserGroup | undefined>;

    /**
     * Update user.
     *
     * @param user - The user that must be updated.
     *
     * @returns promise
     */
    updateUser(user: IUser): Promise<void>;

    /**
     * Create user group.
     *
     * @param group - The user group that must be created.
     *
     * @returns promise
     */
    createUserGroup(group: IUserGroup): Promise<void>;

    /**
     * Update user group.
     *
     * @param group - The user group that must be updated.
     *
     * @returns promise
     */
    updateUserGroup(group: IUserGroup): Promise<void>;

    /**
     * Delete users by ID.
     *
     * @param ids - ID of the user.
     *
     * @returns promise
     */
    deleteUsers(ids: string[]): Promise<void>;

    /**
     * Delete user groups by ID.
     *
     * @param ids - ID of the user group.
     *
     * @returns promise
     */
    deleteUserGroups(ids: string[]): Promise<void>;

    /**
     * Get list of users.
     *
     * @returns promise
     */
    getUsers(): Promise<IOrganizationUser[]>;

    /**
     * Get list of users groups.
     *
     * @returns promise
     */
    getUserGroups(): Promise<IOrganizationUserGroup[]>;

    /**
     * Get groups assigned to the user.
     *
     * @param userId - ID of the user.
     *
     * @returns promise
     */
    getUserGroupsOfUser(userId: string): Promise<IUserGroup[]>;

    /**
     * Get users assigned to the user group.
     *
     * @param userGroupId - ID of the user group.
     *
     * @returns promise
     */
    getUsersOfUserGroup(userGroupId: string): Promise<IUser[]>;

    /**
     * Add users to multiple user groups.
     *
     * @param userIds - IDs of the users that will be assigned to user groups.
     * @param userGroupIds - IDs of the users groups to which user will be assigned.
     *
     * @returns promise
     */
    addUsersToUserGroups(userIds: string[], userGroupIds: string[]): Promise<void>;

    /**
     * Remove users from user groups.
     *
     * @param userIds - IDs of the users.
     * @param userGroupIds - IDs of the user groups.
     *
     * @returns promise
     */
    removeUsersFromUserGroups(userIds: string[], userGroupIds: string[]): Promise<void>;
}
