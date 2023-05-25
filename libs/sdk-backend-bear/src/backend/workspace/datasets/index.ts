// (C) 2019-2022 GoodData Corporation
import { GdcMetadata } from "@gooddata/api-model-bear";
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import { IMetadataObject, IDataset } from "@gooddata/sdk-model";
import { convertMetadataObjectXrefEntry } from "../../../convertors/fromBackend/MetaConverter.js";
import { convertDataSet } from "../../../convertors/fromBackend/DataSetConverter.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";

export class BearWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        const result = await this.authCall((sdk) => sdk.catalogue.loadDataSets(this.workspace));
        return result.map(convertDataSet);
    }

    public async getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        const datasetsResult: GdcMetadata.IObjectXrefEntry[] = await this.authCall((sdk) =>
            sdk.project.getDatasets(this.workspace),
        );

        return datasetsResult.map((dataset: GdcMetadata.IObjectXrefEntry) =>
            convertMetadataObjectXrefEntry("dataSet", dataset),
        );
    }
}
