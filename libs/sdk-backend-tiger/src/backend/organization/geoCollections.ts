// (C) 2026 GoodData Corporation

import { v4 as uuidv4 } from "uuid";

import { type ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    EntitiesApi_CreateEntityCustomGeoCollections,
    EntitiesApi_DeleteEntityCustomGeoCollections,
    EntitiesApi_GetAllEntitiesCustomGeoCollections,
    EntitiesApi_GetEntityCustomGeoCollections,
    EntitiesApi_PatchEntityCustomGeoCollections,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    ResultApi_ConvertGeoFile,
    ResultApi_CustomGeoCollectionStagingUpload,
    ResultApi_ImportCustomGeoCollection,
} from "@gooddata/api-client-tiger/endpoints/result";
import { type IOrganizationGeoCollectionsService, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    type IGeoCollection,
    type IGeoCollectionDefinition,
    type IGeoCollectionFileUploadResult,
} from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class OrganizationGeoCollectionsService implements IOrganizationGeoCollectionsService {
    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    public getAll(): Promise<IGeoCollection[]> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetAllEntitiesCustomGeoCollections(
                client.axios,
                client.basePath,
                {},
            );
            return (result.data?.data || []).map((item) => ({
                id: item.id,
                name: item.attributes?.name ?? undefined,
                description: item.attributes?.description ?? undefined,
            }));
        });
    }

    public getGeoCollection(id: string): Promise<IGeoCollection | undefined> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_GetEntityCustomGeoCollections(client.axios, client.basePath, {
                id,
            });
            const item = result.data?.data;
            if (!item) {
                return undefined;
            }
            return {
                id: item.id,
                name: item.attributes?.name ?? undefined,
                description: item.attributes?.description ?? undefined,
            };
        });
    }

    public createGeoCollection(definition: IGeoCollectionDefinition): Promise<IGeoCollection> {
        const id = `geo_${uuidv4().replace(/-/g, "")}`;
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_CreateEntityCustomGeoCollections(client.axios, client.basePath, {
                jsonApiCustomGeoCollectionInDocument: {
                    data: {
                        id,
                        type: "customGeoCollection",
                        attributes: {
                            name: definition.name,
                            description: definition.description,
                        },
                    },
                },
            });
            const created = result.data?.data;
            if (!created) {
                throw new UnexpectedError("Failed to create geo collection");
            }
            return {
                id: created.id,
                name: created.attributes?.name ?? undefined,
                description: created.attributes?.description ?? undefined,
            };
        });
    }

    public updateGeoCollection(geoCollection: IGeoCollection): Promise<IGeoCollection> {
        return this.authCall(async (client: ITigerClientBase) => {
            const result = await EntitiesApi_PatchEntityCustomGeoCollections(client.axios, client.basePath, {
                id: geoCollection.id,
                jsonApiCustomGeoCollectionPatchDocument: {
                    data: {
                        id: geoCollection.id,
                        type: "customGeoCollection",
                        attributes: {
                            name: geoCollection.name,
                            description: geoCollection.description,
                        },
                    },
                },
            });
            const updated = result.data?.data;
            if (!updated) {
                throw new UnexpectedError("Failed to update geo collection");
            }
            return {
                id: updated.id,
                name: updated.attributes?.name ?? undefined,
                description: updated.attributes?.description ?? undefined,
            };
        });
    }

    public deleteGeoCollection(id: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await EntitiesApi_DeleteEntityCustomGeoCollections(client.axios, client.basePath, { id });
        });
    }

    public uploadGeoCollectionFile(file: File): Promise<IGeoCollectionFileUploadResult> {
        return this.authCall(async (client: ITigerClientBase) => {
            const res = await ResultApi_CustomGeoCollectionStagingUpload(client.axios, client.basePath, {
                file,
            });
            return { location: res.data.location };
        });
    }

    public convertGeoCollectionFile(location: string): Promise<IGeoCollectionFileUploadResult> {
        return this.authCall(async (client: ITigerClientBase) => {
            const res = await ResultApi_ConvertGeoFile(client.axios, client.basePath, {
                convertGeoFileRequest: { location },
            });
            return { location: res.data.location };
        });
    }

    public importGeoCollectionFile(collectionId: string, location: string): Promise<void> {
        return this.authCall(async (client: ITigerClientBase) => {
            await ResultApi_ImportCustomGeoCollection(client.axios, client.basePath, {
                collectionId,
                importGeoCollectionRequest: { location },
            });
        });
    }
}
