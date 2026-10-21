// (C) 2021-2026 GoodData Corporation

import {
    ActionsUtilities,
    type JsonApiDataSourceIdentifierOutWithLinks,
    type JsonApiDataSourceInAttributes,
    type JsonApiDataSourceOutDocument,
    OrganizationUtilities,
    type TestDefinitionRequest,
} from "@gooddata/api-client-tiger";
import { ActionsApi_RegisterUploadNotification } from "@gooddata/api-client-tiger/endpoints/actions";
import {
    EntitiesApi_CreateEntityDataSources,
    EntitiesApi_DeleteEntityDataSources,
    EntitiesApi_GetAllEntitiesDataSourceIdentifiers,
    EntitiesApi_GetAllEntitiesDataSources,
    EntitiesApi_GetEntityDataSources,
    EntitiesApi_PatchEntityDataSources,
    EntitiesApi_UpdateEntityDataSources,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import {
    ScanModelApi_GetDataSourceSchemata,
    ScanModelApi_TestDataSource,
    ScanModelApi_TestDataSourceDefinition,
} from "@gooddata/api-client-tiger/endpoints/scanModel";
import {
    type IDataSourceFilesService,
    type IDataSourcesService,
    isNotAuthenticated,
} from "@gooddata/sdk-backend-spi";
import {
    type IDataSourceConnectionTest,
    type IDataSourceConnectionTestResult,
    type IDataSourceDefinition,
    type IDataSourceDescriptor,
    type IDataSourceIdentifierDescriptor,
    type IDataSourcePatch,
} from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { getDataSourceErrorMessage } from "../../utils/apiProblemDetail.js";

import { TigerDataSourceFilesService } from "./files.js";

function convertdataSourceIdentifier(
    dataSource: JsonApiDataSourceIdentifierOutWithLinks,
): IDataSourceIdentifierDescriptor {
    return {
        id: dataSource.id,
        name: dataSource.attributes.name,
        schema: dataSource.attributes.schema,
        type: dataSource.attributes.type,
    };
}

function convertDataSourceIdentifierWithPermissions(
    dataSource: JsonApiDataSourceIdentifierOutWithLinks,
): IDataSourceDescriptor {
    return {
        ...convertdataSourceIdentifier(dataSource),
        permissions: dataSource.meta?.permissions ?? [],
    };
}

function convertDataSource({ data }: JsonApiDataSourceOutDocument): IDataSourceDescriptor {
    const { attributes } = data;
    return {
        id: data.id,
        type: attributes.type,
        name: attributes.name,
        schema: attributes.schema,
        username: attributes.username ?? undefined,
        url: attributes.url,
        clientId: attributes.clientId ?? undefined,
        permissions: data.meta?.permissions ?? [],
        parameters: attributes.parameters,
        decodedParameters: attributes.decodedParameters,
        cacheStrategy: attributes.cacheStrategy,
        cacheRetention: attributes.cacheRetention,
        authenticationType: attributes.authenticationType,
        dateTimeSemantics: attributes.dateTimeSemantics,
        alternativeDataSourceId: attributes.alternativeDataSourceId,
        disableStatistics: attributes.disableStatistics,
        ignoreJwtAud: attributes.ignoreJwtAud,
    };
}

function toDataSourceAttributes(
    dataSource: IDataSourceDefinition | IDataSourcePatch,
): JsonApiDataSourceInAttributes {
    const attributes = {
        name: dataSource.name,
        password: dataSource.password,
        schema: dataSource.schema,
        token: dataSource.token,
        type: dataSource.type,
        url: dataSource.url,
        username: dataSource.username,
        parameters: dataSource.parameters,
        cacheStrategy: dataSource.cacheStrategy,
        cacheRetention: dataSource.cacheRetention,
        privateKey: dataSource.privateKey,
        privateKeyPassphrase: dataSource.privateKeyPassphrase,
        clientId: dataSource.clientId,
        clientSecret: dataSource.clientSecret,
        dateTimeSemantics: dataSource.dateTimeSemantics,
        authenticationType: dataSource.authenticationType,
        alternativeDataSourceId: dataSource.alternativeDataSourceId,
        disableStatistics: dataSource.disableStatistics,
        ignoreJwtAud: dataSource.ignoreJwtAud,
    };
    // The model type also lists data source types that this backend does not support,
    // and a patch can omit the required attributes. The backend validates both.
    return attributes as JsonApiDataSourceInAttributes;
}

export class TigerDataSourcesService implements IDataSourcesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDataSourceIdentifiers(): Promise<IDataSourceIdentifierDescriptor[]> {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesDataSourceIdentifiers(client.axios, client.basePath, {
                    page,
                    size,
                }).then((response) => response.data.data.map(convertdataSourceIdentifier)),
            );
        });
    }

    public async getDataSources(): Promise<IDataSourceDescriptor[]> {
        return this.authCall(async (client) => {
            const result = await OrganizationUtilities.getAllPagesOf(
                client,
                EntitiesApi_GetAllEntitiesDataSourceIdentifiers,
                { sort: ["name"], metaInclude: ["permissions"] },
            ).then(OrganizationUtilities.mergeEntitiesResults);
            return result.data.map(convertDataSourceIdentifierWithPermissions);
        });
    }

    public async hasDataSources(): Promise<boolean> {
        try {
            return await this.authCall(async (client) => {
                const result = await EntitiesApi_GetAllEntitiesDataSources(client.axios, client.basePath, {
                    size: 1,
                });
                return result.data.data.length > 0;
            });
        } catch (error) {
            if (isNotAuthenticated(error)) {
                throw error;
            }
            return false;
        }
    }

    public async getDataSource(id: string): Promise<IDataSourceDescriptor> {
        return this.toDescriptor(async () =>
            this.authCall((client) =>
                EntitiesApi_GetEntityDataSources(client.axios, client.basePath, { id }),
            ),
        );
    }

    public async createDataSource(definition: IDataSourceDefinition): Promise<IDataSourceDescriptor> {
        return this.toDescriptor(async () =>
            this.authCall((client) =>
                EntitiesApi_CreateEntityDataSources(client.axios, client.basePath, {
                    jsonApiDataSourceInDocument: {
                        data: {
                            id: definition.id,
                            type: "dataSource",
                            attributes: toDataSourceAttributes(definition),
                        },
                    },
                }),
            ),
        );
    }

    public async updateDataSource(
        id: string,
        definition: IDataSourceDefinition,
    ): Promise<IDataSourceDescriptor> {
        return this.toDescriptor(async () =>
            this.authCall((client) =>
                EntitiesApi_UpdateEntityDataSources(client.axios, client.basePath, {
                    id,
                    jsonApiDataSourceInDocument: {
                        data: {
                            id: definition.id,
                            type: "dataSource",
                            attributes: toDataSourceAttributes(definition),
                        },
                    },
                }),
            ),
        );
    }

    public async patchDataSource(id: string, patch: IDataSourcePatch): Promise<IDataSourceDescriptor> {
        return this.toDescriptor(async () =>
            this.authCall((client) =>
                EntitiesApi_PatchEntityDataSources(client.axios, client.basePath, {
                    id,
                    jsonApiDataSourcePatchDocument: {
                        data: {
                            id: patch.id,
                            type: "dataSource",
                            attributes: toDataSourceAttributes(patch),
                        },
                    },
                }),
            ),
        );
    }

    public async deleteDataSource(id: string): Promise<void> {
        await this.authCall((client) =>
            EntitiesApi_DeleteEntityDataSources(client.axios, client.basePath, { id }),
        );
    }

    public async testConnection(
        connection: IDataSourceConnectionTest,
        dataSourceId?: string,
    ): Promise<IDataSourceConnectionTestResult> {
        // The model type also lists data source types that this backend does not support.
        // The backend rejects them, so the cast does not hide an error.
        const request = connection as TestDefinitionRequest;
        try {
            return await this.authCall(async (client) => {
                const result = dataSourceId
                    ? await ScanModelApi_TestDataSource(client.axios, client.basePath, {
                          dataSourceId,
                          testRequest: request,
                      })
                    : await ScanModelApi_TestDataSourceDefinition(client.axios, client.basePath, {
                          testDefinitionRequest: request,
                      });
                return { successful: result.data.successful, error: result.data.error };
            });
        } catch (error) {
            return { successful: false, error: getDataSourceErrorMessage(error) };
        }
    }

    public async getSchemata(dataSourceId: string): Promise<string[]> {
        return this.authCall(async (client) => {
            const result = await ScanModelApi_GetDataSourceSchemata(client.axios, client.basePath, {
                dataSourceId,
            });
            return result.data.schemaNames;
        });
    }

    public async registerUploadNotification(dataSourceId: string): Promise<void> {
        await this.authCall((client) =>
            ActionsApi_RegisterUploadNotification(client.axios, client.basePath, { dataSourceId }),
        );
    }

    public files(): IDataSourceFilesService {
        return new TigerDataSourceFilesService(this.authCall);
    }

    private async toDescriptor(
        call: () => Promise<{ data: JsonApiDataSourceOutDocument }>,
    ): Promise<IDataSourceDescriptor> {
        const result = await call();
        return convertDataSource(result.data);
    }
}
