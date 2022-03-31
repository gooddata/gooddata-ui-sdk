// (C) 2019-2022 GoodData Corporation
import { IDataset, IMetadataObject } from "@gooddata/sdk-model";

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
}
