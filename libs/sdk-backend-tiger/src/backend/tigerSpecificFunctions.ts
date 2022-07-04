// (C) 2022 GoodData Corporation

import {
    JsonApiOrganizationOutMetaPermissionsEnum,
    GenerateLdmRequest,
    DeclarativeModel,
    DeclarativePdm,
    JsonApiDataSourceInDocument,
    LayoutApiSetPdmLayoutRequest,
    LayoutApiPutWorkspaceLayoutRequest,
    DeclarativeTables,
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
    JsonApiDataSourceOutTypeEnum,
    OrganizationUtilities,
    JsonApiDataSourceIdentifierOutWithLinks,
    DataSourceSchemata,
    JsonApiDataSourceIdentifierOutList,
} from "@gooddata/api-client-tiger";
import { convertApiError } from "../utils/errorHandling";
import uniq from "lodash/uniq";
import toLower from "lodash/toLower";
import { UnexpectedError, ErrorConverter, IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { AxiosResponse } from "axios";
import isEmpty from "lodash/isEmpty";
import { AuthenticatedAsyncCall } from "@gooddata/sdk-backend-base";

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
    data: {
        attributes: {
            name: string;
            schema: string;
            type: IDataSourceType;
            url?: string;
            username?: string;
        };
        id: string;
        meta?: {
            permissions?: IDataSourcePermission[];
        };
        type: JsonApiDataSourceOutTypeEnum;
    };
    links?: {
        self: string;
    };
}

/**
 *@internal
 */
export interface IDataSourceApiResult {
    data?: IDataSourceConnectionInfo | IDataSourceTestConnectionResponse;
    errorMessage?: string;
}

/**
 * @internal
 */
export interface IDataSourceUpsertRequest {
    data: {
        attributes: {
            name: string;
            password?: string;
            schema: string;
            token?: string;
            type: IDataSourceType;
            url: string;
            username?: string;
        };
        id: string;
        type: JsonApiDataSourceInTypeEnum;
    };
}

/**
 * @internal
 */
export interface IDataSourceTestConnectionRequest {
    password?: string;
    schema: string;
    token?: string;
    type: string;
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
export interface IDataSourceDefinition {
    id: string;
    name: string;
    type: IDataSourceType;
    permissions: IDataSourcePermission[];
}

/**
 * TigerBackend-specific functions.
 * If possible, avoid these functions, they are here for specific use cases.
 *
 * @internal
 */
export type TigerSpecificFunctions = {
    isCommunityEdition?: () => Promise<boolean>;
    isOrganizationAdmin?: () => Promise<boolean>;
    organizationExpiredDate?: () => Promise<string>;
    getOrganizationAllowedOrigins?: (organizationId: string) => Promise<string[]>;
    getOrganizationPermissions?: (
        organizationId: string,
    ) => Promise<Array<JsonApiOrganizationOutMetaPermissionsEnum>>;
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
        generateLogicalModelRequest: GenerateLdmRequest,
    ) => Promise<DeclarativeModel>;
    scanDataSource?: (dataSourceId: string, scanRequest: ScanRequest) => Promise<ScanResult>;
    publishPdm?: (dataSourceId: string, declarativePdm: DeclarativePdm) => Promise<PublishPdmResult>;
    createDemoDataSource?: (sampleDataSource: JsonApiDataSourceInDocument) => Promise<string>;
    setPdmLayout?: (requestParameters: LayoutApiSetPdmLayoutRequest) => Promise<void>;
    createWorkspace?: (id: string, name: string) => Promise<string>;
    deleteWorkspace?: (id: string) => Promise<void>;
    canDeleteWorkspace?: (id: string) => Promise<boolean>;
    getWorkspaceLogicalModel?: (id: string) => Promise<DeclarativeModel>;
    getEntitlements?: () => Promise<Array<Entitlement>>;
    putWorkspaceLayout?: (requestParameters: LayoutApiPutWorkspaceLayoutRequest) => Promise<void>;
    getAllDataSources?: () => Promise<IDataSourceDefinition[]>;
    getAllDataSourcesIdentifiers?: () => Promise<JsonApiDataSourceIdentifierOutWithLinks[]>;
    getDataSourceById?: (id: string) => Promise<IDataSourceApiResult>;
    createDataSource?: (requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    updateDataSource?: (id: string, requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    deleteDataSource?: (id: string) => Promise<IDataSourceApiResult>;
    testDataSourceConnection?: (
        connectionData: IDataSourceTestConnectionRequest,
        id?: string,
    ) => Promise<IDataSourceTestConnectionResponse>;
    publishLogicalModel?: (workspaceId: string, declarativeModel: DeclarativeModel) => Promise<void>;
    getDataSourceSchemata?: (dataSourceId: string) => Promise<DataSourceSchemata>;
    getPdm?: (dataSourceId: string) => Promise<DeclarativePdm>;
};

const getDataSourceErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
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
        } catch (error) {
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
        } catch (error) {
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
        } catch (error) {
            if (error.response.status === 400) {
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
                // TODO replace with a client call when it can be obtained via OpenAPI documented endpoint
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
        } catch (error) {
            throw convertApiError(error);
        }
    },
    deleteApiToken: async (userId: string, tokenId: string) => {
        try {
            await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityApiTokens({ userId: userId, id: tokenId });
            });
        } catch (error) {
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
        } catch (error) {
            throw convertApiError(error);
        }
    },
    scanDataSource: async (dataSourceId: string, scanRequest: ScanRequest) => {
        return await authApiCall(async (sdk) => {
            // TODO replace sdk.axios call with sdk.actions when API is regenerated for Tiger 1.7
            return await sdk.axios
                .post(`/api/v1/actions/dataSources/${dataSourceId}/scan`, scanRequest)
                .then((res: AxiosResponse) => {
                    return res?.data;
                })
                .catch((err) => {
                    return Promise.reject(`scan error=${JSON.stringify(err.response.data)}`);
                });
        });
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
        } catch (error) {
            throw convertApiError(error);
        }
    },
    setPdmLayout: async (requestParameters: LayoutApiSetPdmLayoutRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.declarativeLayout.setPdmLayout(requestParameters);
            });
        } catch (error) {
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
        } catch (error) {
            throw convertApiError(error);
        }
    },
    deleteWorkspace: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityWorkspaces({ id });
            });
        } catch (error) {
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
    getWorkspaceLogicalModel: async (workspaceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.declarativeLayout.getLogicalModel({ workspaceId });
                return result.data;
            });
        } catch (error) {
            throw convertApiError(error);
        }
    },
    putWorkspaceLayout: async (requestParameters: LayoutApiPutWorkspaceLayoutRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.declarativeLayout.putWorkspaceLayout(requestParameters);
            });
        } catch (error) {
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
        } catch (error) {
            throw convertApiError(error);
        }
    },
    getAllDataSources: async () => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getAllEntitiesDataSourceIdentifiers({
                    sort: ["name"],
                    metaInclude: ["permissions"],
                    size: 250,
                    page: 0,
                });
                return result.data?.data.map((item) => ({
                    id: item.id,
                    name: item.attributes.name,
                    type: item.attributes.type,
                    permissions: item.meta?.permissions ?? [],
                }));
            });
        } catch (error) {
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
                    .then((axiosResponse) => ({ data: { data: axiosResponse.data.data } }));
            });
        } catch (error) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    createDataSource: async (requestData: IDataSourceUpsertRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .createEntityDataSources({
                        jsonApiDataSourceInDocument: requestData,
                    })
                    .then((axiosResponse) => ({ data: axiosResponse.data }));
            });
        } catch (error) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    updateDataSource: async (id: string, requestData: IDataSourceUpsertRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .updateEntityDataSources({
                        id,
                        jsonApiDataSourceInDocument: requestData,
                    })
                    .then((axiosResponse) => ({ data: axiosResponse.data }));
            });
        } catch (error) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    deleteDataSource: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityDataSources({
                    id,
                });
                return { data: { successful: true } };
            });
        } catch (error) {
            return { errorMessage: getDataSourceErrorMessage(error) };
        }
    },
    testDataSourceConnection: async (connectionData: IDataSourceTestConnectionRequest, id?: string) => {
        try {
            return await authApiCall(async (sdk) => {
                // TODO replace sdk.axios call with sdk.actions when API is regenerated for Tiger 1.7
                const TEST_CONNECTION_DATA_SOURCE_URI = "/api/v1/actions/dataSource/test";
                const TEST_CONNECTION_EXISTING_DATA_SOURCE_URI =
                    "/api/v1/actions/dataSources/DATA_SOURCE_ID/test";
                const apiUrl =
                    id && isEmpty(connectionData)
                        ? TEST_CONNECTION_EXISTING_DATA_SOURCE_URI.replace("DATA_SOURCE_ID", id)
                        : TEST_CONNECTION_DATA_SOURCE_URI;
                const response = await sdk.axios.post(apiUrl, connectionData);
                return response.data as IDataSourceTestConnectionResponse;
            });
        } catch (error) {
            return {
                successful: false,
                error: getDataSourceErrorMessage(error),
            };
        }
    },
    getDataSourceSchemata: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            return await sdk.scanModel.getDataSourceSchemata({ dataSourceId }).then((res: AxiosResponse) => {
                return res?.data;
            });
        });
    },
    getPdm: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            return await sdk.declarativeLayout
                .getPdmLayout({
                    dataSourceId,
                })
                .then((res: AxiosResponse) => {
                    return res?.data;
                });
        });
    },
    getAllDataSourcesIdentifiers: async () => {
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
                .then((res: JsonApiDataSourceIdentifierOutList) => {
                    return res?.data;
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
});
