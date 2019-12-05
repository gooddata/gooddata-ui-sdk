// (C) 2019 GoodData Corporation
import { IDataset } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceDatasetsService {
    getDatasets(): Promise<IDataset[]>;
}
