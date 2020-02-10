// (C) 2019-2020 GoodData Corporation
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import { IDataset } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { datasets } from "./mocks/datasets";

export class TigerWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        return this.authCall(async () => datasets);
    }
}
