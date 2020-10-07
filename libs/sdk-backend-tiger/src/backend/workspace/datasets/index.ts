// (C) 2019-2020 GoodData Corporation
import { IWorkspaceDatasetsService, IDataset } from "@gooddata/sdk-backend-spi";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        return this.authCall(async () => []);
    }
}
