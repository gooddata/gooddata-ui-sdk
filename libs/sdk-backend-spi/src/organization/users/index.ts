// (C) 2023 GoodData Corporation

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
     * Delete user by ID.
     *
     * @param id - ID of the user.
     *
     * @returns promise
     */
    deleteUser(id: string): Promise<void>;

    /**
     * Delete user group by ID.
     *
     * @param id - ID of the user group.
     *
     * @returns promise
     */
    deleteUserGroup(id: string): Promise<void>;

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
     * Add user group to multiple users.
     *
     * @param userGroupId - ID of the user group that will be assigned to the users.
     * @param userIds - IDs of the users that will have the new user group assigned.
     *
     * @returns promise
     */
    addUserGroupToUsers(userGroupId: string, userIds: string[]): Promise<void>;

    /**
     * Add user to multiple user groups.
     *
     * @param userId - ID of the user that will be assigned to user groups.
     * @param userGroupIds - IDs of the users groups to which user will be assigned.
     *
     * @returns promise
     */
    addUserToUserGroups(userId: string, userGroupIds: string[]): Promise<void>;

    /**
     * Remove user from user group.
     *
     * @param userId - ID of the user.
     * @param userGroupId - ID of the user group.
     *
     * @returns promise
     */
    removeUserFromUserGroup(userId: string, userGroupId: string): Promise<void>;
}
