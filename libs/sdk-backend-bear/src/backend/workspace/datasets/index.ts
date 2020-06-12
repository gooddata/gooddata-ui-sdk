// (C) 2019-2020 GoodData Corporation
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import { IDataset } from "@gooddata/sdk-model";
import { convertDataSet } from "../../../convertors/toSdkModel/DataSetConverter";
import { BearAuthenticatedCallGuard } from "../../../types";

export class BearWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        const result = await this.authCall(sdk => sdk.catalogue.loadDataSets(this.workspace));
        return result.map(convertDataSet);
    }
}
