// (C) 2019-2025 GoodData Corporation
import { IDataSetMetadataObject, IDataset, IMetadataObject, ObjRef } from "@gooddata/sdk-model";

/**
 * Service for querying workspace datasets
 *
 * @public
 */
export interface IWorkspaceDatasetsService {
    /**
     * Receive all workspace csv datasets
     *
     * @returns promise of workspace csv datasets
     */
    getDatasets(): Promise<IDataset[]>;

    /**
     * Receive all workspace datasets metadata
     *
     * @returns promise of workspace datasets metadata
     */
    getAllDatasetsMeta(): Promise<IMetadataObject[]>;

    /**
     * Get all dataSets for given refs
     *
     * @returns promise array of workspace dataSets metadata objects
     */
    getDataSets(refs: ObjRef[]): Promise<IDataSetMetadataObject[]>;
}
