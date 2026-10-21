// (C) 2021-2026 GoodData Corporation

import {
    type IDataSourceConnectionTest,
    type IDataSourceConnectionTestResult,
    type IDataSourceDefinition,
    type IDataSourceDescriptor,
    type IDataSourceIdentifierDescriptor,
    type IDataSourcePatch,
} from "@gooddata/sdk-model";

import { type IDataSourceFilesService } from "./files.js";

/**
 * Service to work with data sources
 *
 * @alpha
 */
export interface IDataSourcesService {
    /**
     * Returns data source identifiers
     */
    getDataSourceIdentifiers(): Promise<IDataSourceIdentifierDescriptor[]>;

    /**
     * Returns all data sources that the current user can see, sorted by name.
     *
     * @remarks
     * The result contains the permissions of the current user, but not the connection details.
     */
    getDataSources(): Promise<IDataSourceDescriptor[]>;

    /**
     * Checks if the current user can see at least one data source.
     *
     * @returns false also when the backend refuses the request
     */
    hasDataSources(): Promise<boolean>;

    /**
     * Returns a data source with its connection details.
     *
     * @param id - identifier of the data source
     */
    getDataSource(id: string): Promise<IDataSourceDescriptor>;

    /**
     * Creates a data source.
     *
     * @param definition - definition of the data source
     */
    createDataSource(definition: IDataSourceDefinition): Promise<IDataSourceDescriptor>;

    /**
     * Replaces a data source with a new definition.
     *
     * @param id - identifier of the data source
     * @param definition - new definition of the data source
     */
    updateDataSource(id: string, definition: IDataSourceDefinition): Promise<IDataSourceDescriptor>;

    /**
     * Changes some properties of a data source.
     *
     * @param id - identifier of the data source
     * @param patch - properties to change
     */
    patchDataSource(id: string, patch: IDataSourcePatch): Promise<IDataSourceDescriptor>;

    /**
     * Deletes a data source.
     *
     * @param id - identifier of the data source
     */
    deleteDataSource(id: string): Promise<void>;

    /**
     * Tests a connection to a data source.
     *
     * @param connection - connection details to test
     * @param dataSourceId - identifier of a saved data source; when set, the backend uses its stored secrets
     *  for the details that the connection does not specify
     * @returns promise that does not reject when the test fails; the result has the reason instead
     */
    testConnection(
        connection: IDataSourceConnectionTest,
        dataSourceId?: string,
    ): Promise<IDataSourceConnectionTestResult>;

    /**
     * Returns names of the schemata available in a data source.
     *
     * @param dataSourceId - identifier of the data source
     */
    getSchemata(dataSourceId: string): Promise<string[]>;

    /**
     * Registers an upload notification for a data source. The backend then computes the reports again with the new
     * data and drops the cached results of the data source.
     *
     * @param dataSourceId - identifier of the data source
     */
    registerUploadNotification(dataSourceId: string): Promise<void>;

    /**
     * Returns service that can be used to manage files of data sources that keep their data in files.
     */
    files(): IDataSourceFilesService;
}
