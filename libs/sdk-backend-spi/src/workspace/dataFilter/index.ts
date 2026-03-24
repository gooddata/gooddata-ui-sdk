// (C) 2024-2026 GoodData Corporation

import {
    type IWorkspaceDataFilter,
    type IWorkspaceDataFilterDefinition,
    type ObjRef,
    type UserDataFilter,
    type UserDataFilterDefinition,
} from "@gooddata/sdk-model";

/**
 * The service that returns information about data filters.
 *
 * Supports both Workspace Data Filters and User Data Filters.
 *
 * @alpha
 */
export interface IDataFiltersService {
    /**
     * Get data filters for the current workspace with their settings.
     *
     * @deprecated - the function has been renamed, use {@link IDataFiltersService#getDataFilters} instead
     * @alpha
     */
    getWorkspaceDataFilters(): Promise<IWorkspaceDataFilter[]>;

    /**
     * Get data filters for the current workspace with their settings.
     */
    getDataFilters(): Promise<IWorkspaceDataFilter[]>;

    /**
     * Create a new data filter (without setting).
     */
    createDataFilter(newDataFilter: IWorkspaceDataFilterDefinition): Promise<IWorkspaceDataFilter>;

    /**
     * Update an existing data filter.
     * The setting is not updated, only the data filter.
     */
    updateDataFilter(updatedDataFilter: IWorkspaceDataFilter): Promise<IWorkspaceDataFilter>;

    /**
     * Update value of existing data filter.
     */
    updateDataFilterValue(dataFilter: ObjRef, values: string[]): Promise<void>;

    /**
     * Delete an existing data filter.
     */
    deleteDataFilter(ref: ObjRef): Promise<void>;

    // --- User Data Filters ---

    /**
     * Get all user data filters for the current workspace.
     */
    getUserDataFilters(): Promise<UserDataFilter[]>;

    /**
     * Create a new user data filter.
     */
    createUserDataFilter(newUserDataFilter: UserDataFilterDefinition): Promise<UserDataFilter>;

    /**
     * Update an existing user data filter.
     */
    updateUserDataFilter(updatedUserDataFilter: UserDataFilter): Promise<UserDataFilter>;

    /**
     * Delete an existing user data filter.
     */
    deleteUserDataFilter(ref: ObjRef): Promise<void>;
}
