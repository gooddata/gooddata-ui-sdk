// (C) 2019-2025 GoodData Corporation
import { IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import {
    IDataSetMetadataObject,
    IDataset,
    IMetadataObject,
    ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public async getDatasets(): Promise<IDataset[]> {
        return this.authCall(async () => []);
    }

    public async getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        return this.authCall(async () => []);
    }

    public getDataSets(refs: ObjRef[]): Promise<IDataSetMetadataObject[]> {
        if (refs.length === 0) {
            return Promise.resolve([]);
        }

        return this.authCall(async (client) => {
            const filter = refs
                .filter(isIdentifierRef)
                .map((ref) => `id==${ref.identifier}`)
                .join(",");
            const dataSets = await client.entities.getAllEntitiesDatasets({
                workspaceId: this.workspace,
                filter,
            });
            const result = dataSets?.data?.data ?? [];
            return result.map(convertDataSetItem);
        });
    }
}
