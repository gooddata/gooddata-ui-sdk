// (C) 2019 GoodData Corporation
import { IWorkspaceDataSetsService } from "@gooddata/sdk-backend-spi";
import { IDataSet, IDateDataSet } from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";
import { convertDateDataSet } from "./fromSdkModel/DateDataSetConverter";
import { convertDataSet } from "./fromSdkModel/DataSetConverter";

export class BearWorkspaceDataSets implements IWorkspaceDataSetsService {
    constructor(private readonly authCall: AuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDataSets(): Promise<IDataSet[]> {
        const result = await this.authCall(sdk => sdk.catalogue.loadDataSets(this.workspace));
        return result.map(convertDataSet);
    }

    public async getDateDataSets(): Promise<IDateDataSet[]> {
        const result = await this.authCall(sdk => sdk.catalogue.loadDateDataSets(this.workspace, {}));
        return result.dateDataSetsResponse.dateDataSets.map(convertDateDataSet);
    }
}
