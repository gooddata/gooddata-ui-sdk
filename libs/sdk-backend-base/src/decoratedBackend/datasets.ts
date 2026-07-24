// (C) 2025-2026 GoodData Corporation

import { type IDatasetsQuery, type IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import {
    type IDataSetMetadataObject,
    type IDataset,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceDatasetsService implements IWorkspaceDatasetsService {
    protected constructor(protected readonly decorated: IWorkspaceDatasetsService) {}

    public getDatasets(): Promise<IDataset[]> {
        return this.decorated.getDatasets();
    }

    public getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        return this.decorated.getAllDatasetsMeta();
    }

    public getDataSets(refs: ObjRef[]): Promise<IDataSetMetadataObject[]> {
        return this.decorated.getDataSets(refs);
    }

    public getDataset(ref: ObjRef): Promise<IDataSetMetadataObject> {
        return this.decorated.getDataset(ref);
    }

    public updateDatasetMeta(
        dataSet: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IDataSetMetadataObject> {
        return this.decorated.updateDatasetMeta(dataSet);
    }

    public getDatasetsQuery(): IDatasetsQuery {
        return this.decorated.getDatasetsQuery();
    }
}
