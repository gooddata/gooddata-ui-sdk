// (C) 2023-2024 GoodData Corporation

import { IUser, IUserGroup, IOrganizationUser, IOrganizationUserGroup } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

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
     * Get user by email.
     *
     * @param email - email of the user.
     *
     * @returns promise of array of users
     */
    getUsersByEmail(email: string): Promise<IUser[]>;

    /**
     * List users.
     *
     * @returns promise
     */
    getUsersQuery(): IOrganizationUsersQuery;

    /**
     * Get list of users groups.
     *
     * @returns promise
     */
    getUserGroups(): Promise<IOrganizationUserGroup[]>;

    /**
     * List user groups.
     *
     * @returns promise
     */
    getUserGroupsQuery(): IOrganizationUserGroupsQuery;

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

/**
 * Service to query valid filter elements for particular filter.
 *
 * @public
 */
export interface IOrganizationUsersQuery {
    /**
     * Sets number of users to return per page.
     * Default size is specific per backend
     *
     * @param size - desired max number of organization users per page; must be a positive number
     * @returns organization users query
     */
    withSize(size: number): IOrganizationUsersQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns organization users query
     */
    withPage(page: number): IOrganizationUsersQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns organization users query
     */
    withFilter(filter: {
        workspace?: string;
        group?: string;
        name?: string;
        dataSource?: string;
        email?: string;
    }): IOrganizationUsersQuery;

    /**
     * Starts the organization users query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IOrganizationUsersQueryResult>;
}

/**
 * Paged result of organization users query. Last page of data returns empty items.
 *
 * @public
 */
export type IOrganizationUsersQueryResult = IPagedResource<IOrganizationUser>;

/**
 * Service to query valid filter elements for particular filter.
 *
 * @public
 */
export interface IOrganizationUserGroupsQuery {
    /**
     * Sets number of users to return per page.
     * Default size is specific per backend
     *
     * @param size - desired max number of organization users per page; must be a positive number
     * @returns organization users query
     */
    withSize(size: number): IOrganizationUserGroupsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns organization users query
     */
    withPage(page: number): IOrganizationUserGroupsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns organization user groups query
     */
    withFilter(filter: {
        workspace?: string;
        group?: string;
        name?: string;
        dataSource?: string;
    }): IOrganizationUserGroupsQuery;

    /**
     * Starts the organization users query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IOrganizationUserGroupsQueryResult>;
}

/**
 * Paged result of organization users query. Last page of data returns empty items.
 *
 * @public
 */
export type IOrganizationUserGroupsQueryResult = IPagedResource<IOrganizationUserGroup>;
