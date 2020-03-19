// (C) 2019-2020 GoodData Corporation

import { IDataset } from "@gooddata/sdk-model";

/**
 * Service for querying workspace datasets
 *
 * @public
 */
export interface IWorkspaceDatasetsService {
    /**
     * Receive all workspace datasets
     *
     * @returns promise of workspace datasets
     */
    getDatasets(): Promise<IDataset[]>;
}
