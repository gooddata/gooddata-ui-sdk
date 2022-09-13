// (C) 2022 GoodData Corporation

import {
    JsonApiOrganizationOutMetaPermissionsEnum,
    GenerateLdmRequest,
    DeclarativeModel,
    DeclarativePdm,
    JsonApiDataSourceInDocument,
    LayoutApiSetPdmLayoutRequest,
    LayoutApiPutWorkspaceLayoutRequest,
    jsonApiHeaders,
    JsonApiOrganizationPatchTypeEnum,
    JsonApiApiTokenOutList,
    MetadataUtilities,
    JsonApiApiTokenInDocument,
    JsonApiApiTokenInTypeEnum,
    JsonApiWorkspaceInTypeEnum,
    ITigerClient,
    JsonApiDataSourceInTypeEnum,
    JsonApiDataSourceInAttributesTypeEnum,
    OrganizationUtilities,
    JsonApiDataSourceIdentifierOutWithLinks,
    TestDefinitionRequestTypeEnum,
    JsonApiDataSourceOutDocument,
    JsonApiDataSourceIdentifierOutDocument,
    DeclarativeTables,
    DeclarativeAnalytics,
    JsonApiWorkspaceInDocument,
    DependentEntitiesRequest,
    DependentEntitiesResponse,
    ApiEntitlement,
    ActionsApiProcessInvitationRequest,
    PlatformUsage,
    DeclarativeWorkspaceDataFilters,
} from "@gooddata/api-client-tiger";
import { convertApiError } from "../utils/errorHandling";
import uniq from "lodash/uniq";
import toLower from "lodash/toLower";
import { UnexpectedError, ErrorConverter, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty";
import { AuthenticatedAsyncCall } from "@gooddata/sdk-backend-base";
import { AxiosRequestConfig } from "axios";

/**
 * @internal
 */
export interface IApiToken {
    id: string;
}

/**
 * @internal
 */
export interface IApiTokenExtended extends IApiToken {
    bearerToken: string | undefined;
}

/**
 * Copy of interface from gooddata/data-source-management
 * This should be refactored to have the source of truth here in SDK and not expose JSON API entities
 *
 * @internal
 */
export interface IDataSource {
    entity: JsonApiDataSourceInDocument;
    pdm: DeclarativePdm;
}

/**
 * @internal
 */
export interface ScanRequest {
    scanTables: boolean;
    scanViews: boolean;
    separator: string;
    tablePrefix: string;
    viewPrefix: string;
    schemata: string[];
}

/**
 * @internal
 */
export interface ScanResult {
    pdm: DeclarativeTables;
}

/**
 * @internal
 */
export interface PublishPdmResult {
    status: string;
}

/**
 * @internal
 */
export interface Entitlement {
    id: string;
    value?: string;
    expiry?: string;
}

/**
 * @internal
 */
export type IDataSourceType = JsonApiDataSourceInAttributesTypeEnum;

/**
 * @internal
 */
export type IDataSourcePermission = "MANAGE" | "USE";

/**
 * @internal
 */
export interface IDataSourceConnectionInfo {
    id: string;
    type: IDataSourceType;
    name: string;
    schema: string;
    username?: string;
    url?: string;
    permissions?: IDataSourcePermission[];
}

/**
 *@internal
 */
export interface IDataSourceApiResult {
    data?: IDataSourceConnectionInfo;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IDataSourceUpsertRequest {
    id: string;
    name: string;
    password?: string;
    schema: string;
    token?: string;
    type: IDataSourceType;
    url: string;
    username?: string;
}

/**
 * @internal
 */
export interface IDataSourceTestConnectionRequest {
    password?: string;
    schema: string;
    token?: string;
    type: TestDefinitionRequestTypeEnum;
    url: string;
    username: string;
}

/**
 * @internal
 */
export interface IDataSourceTestConnectionResponse {
    successful: boolean;
    error?: string;
}

/**
 * @internal
 */
export interface IDataSourceDeletedResponse {
    successful?: boolean;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IInvitationUserResponse {
    successful?: boolean;
    errorMessage?: string;
}

/**
 * @internal
 */
export type OrganizationPermission = JsonApiOrganizationOutMetaPermissionsEnum;

/**
 * @internal
 */
export type GenerateLogicalModelRequest = GenerateLdmRequest;

/**
 * @internal
 */
export type DeclarativeLogicalModel = DeclarativeModel;

/**
 * @internal
 */
export type DeclarativeAnalyticsModel = DeclarativeAnalytics;

/**
 * @internal
 */
export type PhysicalDataModel = DeclarativePdm;

/**
 * @internal
 */
export type SetPdmLayoutRequest = LayoutApiSetPdmLayoutRequest;

/**
 * @internal
 */
export type PutWorkspaceLayoutRequest = LayoutApiPutWorkspaceLayoutRequest;

/**
 * @internal
 */
export type DataSourceDefinition = JsonApiDataSourceInDocument;

/**
 * @internal
 */
export type WorkspaceDefinition = JsonApiWorkspaceInDocument;

/**
 * @internal
 */
export type DependentEntitiesGraphRequest = DependentEntitiesRequest;

/**
 * @internal
 */
export type DependentEntitiesGraphResponse = DependentEntitiesResponse;

/**
 * @internal
 */
export type WorkspaceDataFiltersLayout = DeclarativeWorkspaceDataFilters;

/**
 * TigerBackend-specific functions.
 * If possible, avoid these functions, they are here for specific use cases.
 *
 * Do not use parameters or return values from \@gooddata/api-client-tiger.
 *
 * @internal
 */
export type TigerSpecificFunctions = {
    isCommunityEdition?: () => Promise<boolean>;
    isOrganizationAdmin?: () => Promise<boolean>;
    organizationExpiredDate?: () => Promise<string>;
    getOrganizationAllowedOrigins?: (organizationId: string) => Promise<string[]>;
    getOrganizationPermissions?: (organizationId: string) => Promise<Array<OrganizationPermission>>;
    updateOrganizationAllowedOrigins?: (
        organizationId: string,
        updatedOrigins: string[],
    ) => Promise<string[]>;
    getDeploymentVersion?: () => Promise<string>;
    getAllApiTokens?: (userId: string) => Promise<IApiToken[]>;
    generateApiToken?: (userId: string, tokenId: string) => Promise<IApiTokenExtended | undefined>;
    deleteApiToken?: (userId: string, tokenId: string) => Promise<void>;
    someDataSourcesExists?: (filter?: string) => Promise<boolean>;
    generateLogicalModel?: (
        dataSourceId: string,
        generateLogicalModelRequest: GenerateLogicalModelRequest,
    ) => Promise<DeclarativeLogicalModel>;
    scanDataSource?: (dataSourceId: string, scanRequest: ScanRequest) => Promise<ScanResult>;
    publishPdm?: (dataSourceId: string, declarativePdm: PhysicalDataModel) => Promise<PublishPdmResult>;
    createDemoDataSource?: (sampleDataSource: DataSourceDefinition) => Promise<string>;
    setPdmLayout?: (requestParameters: SetPdmLayoutRequest) => Promise<void>;
    createWorkspace?: (id: string, name: string) => Promise<string>;
    updateWorkspaceTitle?: (id: string, name: string) => Promise<void>;
    deleteWorkspace?: (id: string) => Promise<void>;
    canDeleteWorkspace?: (id: string) => Promise<boolean>;
    getWorkspaceLogicalModel?: (id: string, includeParents?: boolean) => Promise<DeclarativeLogicalModel>;
    getEntitlements?: () => Promise<Array<Entitlement>>;
    putWorkspaceLayout?: (requestParameters: PutWorkspaceLayoutRequest) => Promise<void>;
    getAllDataSources?: () => Promise<IDataSourceConnectionInfo[]>;
    getDataSourceById?: (id: string) => Promise<IDataSourceApiResult>;
    getDataSourceIdentifierById?: (id: string) => Promise<IDataSourceApiResult>;
    createDataSource?: (requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    updateDataSource?: (id: string, requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    deleteDataSource?: (id: string) => Promise<IDataSourceDeletedResponse>;
    testDataSourceConnection?: (
        connectionData: IDataSourceTestConnectionRequest,
        id?: string,
    ) => Promise<IDataSourceTestConnectionResponse>;
    publishLogicalModel?: (workspaceId: string, declarativeModel: DeclarativeLogicalModel) => Promise<void>;
    getDataSourceSchemata?: (dataSourceId: string) => Promise<string[]>;
    getPdm?: (dataSourceId: string) => Promise<PhysicalDataModel>;
    getDependentEntitiesGraph?: (workspaceId: string) => Promise<DependentEntitiesGraphResponse>;
    getDependentEntitiesGraphFromEntryPoints?: (
        workspaceId: string,
        dependentEntitiesGraphRequest: DependentEntitiesGraphRequest,
    ) => Promise<DependentEntitiesGraphResponse>;
    resolveAllEntitlements?: () => Promise<ApiEntitlement[]>;
    getAllPlatformUsage?: () => Promise<PlatformUsage[]>;
    inviteUser?: (
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ) => Promise<IInvitationUserResponse>;
    getWorkspaceDataFiltersLayout?: () => Promise<WorkspaceDataFiltersLayout>;
    setWorkspaceDataFiltersLayout?: (workspaceDataFiltersLayout: WorkspaceDataFiltersLayout) => Promise<void>;
};

const getDataSourceErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

const dataSourceResponseAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceOutDocument,
): IDataSourceConnectionInfo => {
    const { id, meta, attributes } = response.data;
    const { name, url, type, schema, username } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username,
        url,
        permissions: meta?.permissions ?? [],
    };
};

const dataSourceIdentifierOutWithLinksAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceIdentifierOutWithLinks,
): IDataSourceConnectionInfo => {
    const { id, meta, attributes } = response;
    const { name, type, schema } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: undefined,
        url: undefined,
        permissions: meta?.permissions ?? [],
    };
};

const dataSourceIdentifierOutDocumentAsDataSourceConnectionInfo = (
    response: JsonApiDataSourceIdentifierOutDocument,
): IDataSourceConnectionInfo => {
    const {
        data: { attributes, id, meta },
    } = response;
    const { name, type, schema } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: undefined,
        url: undefined,
        permissions: meta?.permissions ?? [],
    };
};

export const buildTigerSpecificFunctions = (
    backend: IAnalyticalBackend,
    authApiCall: <T>(
        call: AuthenticatedAsyncCall<ITigerClient, T>,
        errorConverter?: ErrorConverter,
    ) => Promise<T>,
): TigerSpecificFunctions => ({
    isCommunityEdition: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const response = await sdk.entities.getAllEntitiesWorkspaces(
                    { page: 0, size: 1 },
                    { headers: jsonApiHeaders },
                );

                // the header name are all lowercase in this object
                return response.headers["gooddata-deployment"] === "aio";
            });
        } catch {
            return false;
        }
    },
    isOrganizationAdmin: async () => {
        try {
            const orgPermissions = await authApiCall(async (sdk) => {
                const { organizationId } = await backend.organizations().getCurrentOrganization();
                const response = await sdk.entities.getEntityOrganizations({
                    id: organizationId,
                    metaInclude: ["permissions"],
                });
                return response.data.data.meta?.permissions || [];
            });
            const isOrganizationManage = (permissions: string[]): boolean => permissions.includes("MANAGE");
            return isOrganizationManage(orgPermissions);
        } catch {
            return false;
        }
    },
    organizationExpiredDate: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const response = await sdk.entities.getAllEntitiesEntitlements({});
                const contractEntitlement = response.data.data.find((item) => item.id === "Contract");
                return contractEntitlement?.attributes?.expiry || "";
            });
        } catch {
            return "";
        }
    },
    getOrganizationAllowedOrigins: async (organizationId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityOrganizations({ id: organizationId });
                return result.data?.data?.attributes?.allowedOrigins || [];
            });
        } catch (error: any) {
            return [];
        }
    },
    getOrganizationPermissions: async (organizationId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityOrganizations({
                    id: organizationId,
                    metaInclude: ["permissions"],
                });
                return result.data.data?.meta?.permissions || [];
            });
        } catch (error: any) {
            const toleratedCodes = [404, 403];
            if (
                toleratedCodes.includes(error?.response?.status) ||
                toleratedCodes.includes(error?.cause?.response?.status) // the error might be wrapped by an UnexpectedResponseError so check for it too
            ) {
                // temporary - 404 gets returned if you are not org admin
                return [];
            }
            throw convertApiError(error);
        }
    },
    updateOrganizationAllowedOrigins: async (organizationId: string, updatedOrigins: string[]) => {
        const sanitizeOrigins = (origins: Array<string>) => {
            const arr = origins ? origins : [];
            return uniq(arr.map((s) => toLower(s))).sort();
        };
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.patchEntityOrganizations({
                    id: organizationId,
                    jsonApiOrganizationPatchDocument: {
                        data: {
                            id: organizationId,
                            type: JsonApiOrganizationPatchTypeEnum.ORGANIZATION,
                            attributes: {
                                allowedOrigins: updatedOrigins,
                            },
                        },
                    },
                });
                return sanitizeOrigins(result.data?.data?.attributes?.allowedOrigins || []);
            });
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error?.response?.data?.detail
                    ? error?.response?.data?.detail
                    : "Server error";
                throw new UnexpectedError(message, error);
            }
            throw convertApiError(error);
        }
    },
    getDeploymentVersion: async () => {
        try {
            return await authApiCall(async (sdk) => {
                // TODO use a client call when available via some endpoint described in OpenAPI
                const profile = await sdk.axios.get("/api/v1/profile");
                return profile?.headers?.["gooddata-deployment"];
            });
        } catch {
            return undefined;
        }
    },
    getAllApiTokens: async (userId: string) => {
        const mapTokens = (tokens: JsonApiApiTokenOutList): IApiToken[] => {
            return tokens.data.map((item) => {
                const result: IApiToken = {
                    id: item.id,
                };
                return result;
            });
        };
        try {
            return await authApiCall(async (sdk) => {
                return await MetadataUtilities.getAllPagesOf(sdk, sdk.entities.getAllEntitiesApiTokens, {
                    userId,
                })
                    .then(MetadataUtilities.mergeEntitiesResults)
                    .then(mapTokens);
            });
        } catch {
            return [];
        }
    },
    generateApiToken: async (userId: string, tokenId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const apiTokenDocument: JsonApiApiTokenInDocument = {
                    data: {
                        id: tokenId,
                        type: JsonApiApiTokenInTypeEnum.API_TOKEN,
                    },
                };
                const result = await sdk.entities.createEntityApiTokens({
                    userId: userId,
                    jsonApiApiTokenInDocument: apiTokenDocument,
                });
                return {
                    id: result.data.data?.id,
                    bearerToken: result.data.data?.attributes?.bearerToken,
                };
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    deleteApiToken: async (userId: string, tokenId: string) => {
        try {
            await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityApiTokens({ userId: userId, id: tokenId });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    someDataSourcesExists: async (filter?: string) => {
        return await authApiCall(async (sdk) => {
            const requestParams = filter ? { filter } : {};
            return sdk.entities
                .getAllEntitiesDataSources(requestParams)
                .then((axiosResponse) => axiosResponse.data.data?.length > 0)
                .catch(() => {
                    return false;
                });
        });
    },
    generateLogicalModel: async (dataSourceId: string, generateLdmRequest: GenerateLdmRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.actions
                    .generateLogicalModel({
                        dataSourceId,
                        generateLdmRequest,
                    })
                    .then((axiosResponse) => axiosResponse.data);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    scanDataSource: async (dataSourceId: string, scanRequest: ScanRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.scanModel
                    .scanDataSource({
                        dataSourceId,
                        scanRequest,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    publishPdm: async (dataSourceId: string, declarativePdm: DeclarativePdm) => {
        return await authApiCall(async (sdk) => {
            return await sdk.declarativeLayout
                .setPdmLayout({
                    dataSourceId,
                    declarativePdm,
                })
                .then(
                    () => {
                        return {
                            status: "success",
                        };
                    },
                    (error) => {
                        return Promise.reject(error);
                    },
                );
        });
    },
    createDemoDataSource: async (sampleDataSource: JsonApiDataSourceInDocument) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.createEntityDataSources({
                    jsonApiDataSourceInDocument: sampleDataSource,
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    setPdmLayout: async (requestParameters: LayoutApiSetPdmLayoutRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.declarativeLayout.setPdmLayout(requestParameters);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createWorkspace: async (id: string, name: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.createEntityWorkspaces({
                    jsonApiWorkspaceInDocument: {
                        data: {
                            attributes: {
                                name,
                            },
                            id,
                            type: JsonApiWorkspaceInTypeEnum.WORKSPACE,
                        },
                    },
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    updateWorkspaceTitle: async (id: string, name: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.updateEntityWorkspaces({
                    id,
                    jsonApiWorkspaceInDocument: {
                        data: {
                            attributes: {
                                name,
                            },
                            id,
                            type: JsonApiWorkspaceInTypeEnum.WORKSPACE,
                        },
                    },
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    deleteWorkspace: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityWorkspaces({ id });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    canDeleteWorkspace: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const childWorkspaces = (
                    await sdk.entities.getAllEntitiesWorkspaces({
                        include: ["workspaces"],
                        filter: `parent.id==${id}`,
                    })
                ).data.data;
                return isEmpty(childWorkspaces);
            });
        } catch (e) {
            return true;
        }
    },
    getWorkspaceLogicalModel: async (workspaceId: string, includeParents: boolean = false) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.declarativeLayout.getLogicalModel({ workspaceId, includeParents });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    putWorkspaceLayout: async (requestParameters: LayoutApiPutWorkspaceLayoutRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.declarativeLayout.putWorkspaceLayout(requestParameters);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getEntitlements: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getAllEntitiesEntitlements({});
                return result.data.data.map((entitlement) => ({
                    id: entitlement.id,
                    value: entitlement.attributes?.value,
                    expiry: entitlement.attributes?.expiry,
                }));
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getDataSourceById: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .getEntityDataSources({
                        id,
                    })
                    .then((axiosResponse) => ({
                        data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                    }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    getDataSourceIdentifierById: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .getEntityDataSourceIdentifiers({
                        id,
                    })
                    .then((axiosResponse) => ({
                        data: dataSourceIdentifierOutDocumentAsDataSourceConnectionInfo(axiosResponse.data),
                    }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    createDataSource: async (requestData: IDataSourceUpsertRequest) => {
        const { id, name, password, schema, token, type, url, username } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .createEntityDataSources({
                        jsonApiDataSourceInDocument: {
                            data: {
                                attributes: {
                                    name,
                                    password,
                                    schema,
                                    token,
                                    type,
                                    url,
                                    username,
                                },
                                id,
                                type: JsonApiDataSourceInTypeEnum.DATA_SOURCE,
                            },
                        },
                    })
                    .then((axiosResponse) => ({
                        data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                    }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    updateDataSource: async (id: string, requestData: IDataSourceUpsertRequest) => {
        const { id: requestDataId, name, password, schema, token, type, url, username } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .updateEntityDataSources({
                        id,
                        jsonApiDataSourceInDocument: {
                            data: {
                                attributes: {
                                    name,
                                    password,
                                    schema,
                                    token,
                                    type,
                                    url,
                                    username,
                                },
                                id: requestDataId,
                                type: JsonApiDataSourceInTypeEnum.DATA_SOURCE,
                            },
                        },
                    })
                    .then((axiosResponse) => ({
                        data: dataSourceResponseAsDataSourceConnectionInfo(axiosResponse.data),
                    }));
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    deleteDataSource: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityDataSources({
                    id,
                });
                return { successful: true };
            });
        } catch (error: any) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    testDataSourceConnection: async (connectionData: IDataSourceTestConnectionRequest, id?: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const promise =
                    id && isEmpty(connectionData)
                        ? sdk.scanModel.testDataSource({
                              dataSourceId: id,
                              body: connectionData,
                          })
                        : sdk.scanModel.testDataSourceDefinition({
                              testDefinitionRequest: connectionData,
                          });
                return await promise.then((axiosResponse) => axiosResponse.data);
            });
        } catch (error: any) {
            return {
                successful: false,
                error: getDataSourceErrorMessage(error),
            };
        }
    },
    getDataSourceSchemata: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            return await sdk.scanModel.getDataSourceSchemata({ dataSourceId }).then((res) => {
                return res?.data.schemaNames;
            });
        });
    },
    getPdm: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            return await sdk.declarativeLayout
                .getPdmLayout({
                    dataSourceId,
                })
                .then((res) => {
                    return res?.data;
                });
        });
    },
    getAllDataSources: async () => {
        return await authApiCall(async (sdk) => {
            return OrganizationUtilities.getAllPagesOf(
                sdk,
                sdk.entities.getAllEntitiesDataSourceIdentifiers,
                {
                    sort: ["name"],
                    metaInclude: ["permissions"],
                },
            )
                .then(OrganizationUtilities.mergeEntitiesResults)
                .then((res) => {
                    return res.data.map(dataSourceIdentifierOutWithLinksAsDataSourceConnectionInfo);
                });
        });
    },
    publishLogicalModel: async (workspaceId: string, declarativeModel: DeclarativeModel) => {
        return await authApiCall(async (sdk) => {
            await sdk.declarativeLayout.setLogicalModel({
                workspaceId,
                declarativeModel,
            });
        });
    },
    getDependentEntitiesGraph: async (workspaceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.actions
                    .getDependentEntitiesGraph({
                        workspaceId,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getDependentEntitiesGraphFromEntryPoints: async (
        workspaceId: string,
        dependentEntitiesGraphRequest: DependentEntitiesGraphRequest,
    ) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.actions
                    .getDependentEntitiesGraphFromEntryPoints({
                        workspaceId,
                        dependentEntitiesRequest: dependentEntitiesGraphRequest,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    resolveAllEntitlements: async () => {
        return authApiCall(async (sdk) => sdk.actions.resolveAllEntitlements().then((res) => res.data));
    },
    getAllPlatformUsage: async () => {
        return authApiCall(async (sdk) => sdk.actions.allPlatformUsage().then((res) => res.data));
    },
    inviteUser: async (
        requestParameters: ActionsApiProcessInvitationRequest,
        options?: AxiosRequestConfig,
    ) => {
        return authApiCall(async (sdk) => {
            return sdk.authActions.processInvitation(requestParameters, options).then((res) => {
                if (res.status == 204) {
                    return {
                        successful: true,
                    } as IInvitationUserResponse;
                } else {
                    return {
                        successful: false,
                        errorMessage: res?.data,
                    } as IInvitationUserResponse;
                }
            });
        });
    },

    getWorkspaceDataFiltersLayout: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.declarativeLayout.getWorkspaceDataFiltersLayout();
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFiltersLayout: async (workspaceDataFiltersLayout: WorkspaceDataFiltersLayout) => {
        return await authApiCall(async (sdk) => {
            await sdk.declarativeLayout.setWorkspaceDataFiltersLayout({
                declarativeWorkspaceDataFilters: workspaceDataFiltersLayout,
            });
        });
    },
});
