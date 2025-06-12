// (C) 2024 GoodData Corporation

import { IWorkspaceDataFilter, ObjRef, IWorkspaceDataFilterDefinition } from "@gooddata/sdk-model";

/**
 * The service that returns information about data filters.
 *
 * Currently, it supports only Workspace Data Filters but in future in can be extended with User Data
 * Filters support.
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
}
