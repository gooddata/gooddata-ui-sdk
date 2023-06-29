// (C) 2019-2022 GoodData Corporation
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import { IMetadataObject, IDataset } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        return this.authCall(async () => []);
    }

    public async getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        return this.authCall(async () => []);
    }
}
