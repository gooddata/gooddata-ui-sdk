// (C) 2019 GoodData Corporation
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import { IDataset } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";
import { convertDataSet } from "./toSdkModel/DataSetConverter";

export class BearWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        const result = await this.authCall(sdk => sdk.catalogue.loadDataSets(this.workspace));
        return result.map(convertDataSet);
    }
}
