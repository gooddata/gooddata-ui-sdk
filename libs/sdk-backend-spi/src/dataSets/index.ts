// (C) 2019 GoodData Corporation
import { IDataSet, IDateDataSet } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceDataSetsService {
    getDataSets(): Promise<IDataSet[]>;
    getDateDataSets(): Promise<IDateDataSet[]>;
}
