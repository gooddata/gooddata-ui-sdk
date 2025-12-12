// (C) 2019-2025 GoodData Corporation
import { EntitiesApi_GetAllEntitiesDatasets } from "@gooddata/api-client-tiger/entitiesObjects";
import { type IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import {
    type IDataSetMetadataObject,
    type IDataset,
    type IMetadataObject,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

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
            const dataSets = await EntitiesApi_GetAllEntitiesDatasets(client.axios, client.basePath, {
                workspaceId: this.workspace,
                filter,
            });
            const result = dataSets?.data?.data ?? [];
            return result.map(convertDataSetItem);
        });
    }
}
