// (C) 2019-2020 GoodData Corporation

import { IDataset } from "../fromModel/ldm/datasets";
import { IMetadataObject } from "../fromModel/ldm/metadata";

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
     * Receive all workspace all datasets
     *
     * @returns promise of workspace datasets
     */
    getAllDatasets(): Promise<IMetadataObject[]>;
}
