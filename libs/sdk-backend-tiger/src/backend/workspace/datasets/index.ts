// (C) 2019-2026 GoodData Corporation

import {
    EntitiesApi_GetAllEntitiesDatasets,
    EntitiesApi_GetEntityDatasets,
    EntitiesApi_PatchEntityDatasets,
    jsonApiHeaders,
} from "@gooddata/api-client-tiger";
import type { IDatasetsQuery, IWorkspaceDatasetsService } from "@gooddata/sdk-backend-spi";
import {
    type IDataSetMetadataObject,
    type IDataset,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    isIdentifierRef,
} from "@gooddata/sdk-model";

import { DatasetsQuery } from "./datasetsQuery.js";
import { convertDataSetItem } from "../../../convertors/fromBackend/DataSetConverter.js";
import type { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { objRefToIdentifier } from "../../../utils/api.js";

export class TigerWorkspaceDataSets implements IWorkspaceDatasetsService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
    ) {}

    public getDatasets(): Promise<IDataset[]> {
        return this.authCall(async () => Promise.resolve([]));
    }

    public async getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        return this.authCall(async () => Promise.resolve([]));
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
            return result.map((dataSet) => convertDataSetItem(dataSet));
        });
    }

    public async getDataset(ref: ObjRef): Promise<IDataSetMetadataObject> {
        const objectId = objRefToIdentifier(ref, this.authCall);

        return this.authCall(async (client) => {
            const result = await EntitiesApi_GetEntityDatasets(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    objectId,
                    include: ["attributes"],
                    metaInclude: ["origin"],
                },
                {
                    headers: jsonApiHeaders,
                },
            );
            return convertDataSetItem(result.data.data, result.data.included);
        });
    }

    public async updateDatasetMeta(
        dataSet: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IDataSetMetadataObject> {
        const objectId = objRefToIdentifier(dataSet.ref, this.authCall);

        return this.authCall(async (client) => {
            const result = await EntitiesApi_PatchEntityDatasets(
                client.axios,
                client.basePath,
                {
                    objectId,
                    workspaceId: this.workspace,
                    jsonApiDatasetPatchDocument: {
                        data: {
                            id: objectId,
                            type: "dataset",
                            attributes: {
                                ...(dataSet.title === undefined ? {} : { title: dataSet.title }),
                                ...(dataSet.description === undefined
                                    ? {}
                                    : { description: dataSet.description }),
                                ...(dataSet.tags === undefined ? {} : { tags: dataSet.tags }),
                            },
                        },
                    },
                },
                {
                    headers: jsonApiHeaders,
                },
            );
            return convertDataSetItem(result.data.data);
        });
    }

    public getDatasetsQuery(): IDatasetsQuery {
        return new DatasetsQuery(this.authCall, { workspaceId: this.workspace });
    }
}
