// (C) 2024 GoodData Corporation

import { IWorkspaceDataFilter } from "@gooddata/sdk-model";

/**
 * The service that returns information about data filters.
 *
 * Currently, it supports only Workspace Data Filters but in future in can be extended with User Data
 * Filters support.
 *
 * @alpha
 */
export interface IDataFiltersService {
    getWorkspaceDataFilters(): Promise<IWorkspaceDataFilter[]>;
}
