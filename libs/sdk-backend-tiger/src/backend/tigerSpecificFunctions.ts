// (C) 2022-2025 GoodData Corporation

import {
    ActionsApiProcessInvitationRequest,
    ActionsApiReadCsvFileManifestsRequest,
    AnalyzeCsvRequest,
    AnalyzeCsvResponse,
    ApiEntitlement,
    DataSourceParameter,
    DeclarativeAnalytics,
    DeclarativeModel,
    DeclarativeWorkspaceDataFilters,
    DependentEntitiesRequest,
    DependentEntitiesResponse,
    GdStorageFile,
    GenerateLdmRequest,
    HierarchyObjectIdentification,
    IdentifierDuplications,
    ImportCsvRequest,
    ImportCsvResponse,
    ITigerClient,
    JsonApiApiTokenInDocument,
    JsonApiApiTokenInTypeEnum,
    JsonApiApiTokenOutList,
    JsonApiCspDirectiveInDocument,
    JsonApiCspDirectiveInTypeEnum,
    JsonApiCustomApplicationSettingOut,
    JsonApiCustomApplicationSettingOutTypeEnum,
    JsonApiDatasetOutList,
    JsonApiDataSourceIdentifierOutDocument,
    JsonApiDataSourceIdentifierOutWithLinks,
    JsonApiDataSourceInAttributesCacheStrategyEnum,
    JsonApiDataSourceInAttributesTypeEnum,
    JsonApiDataSourceInDocument,
    JsonApiDataSourceInTypeEnum,
    JsonApiDataSourceOutAttributesAuthenticationTypeEnum,
    JsonApiDataSourceOutDocument,
    jsonApiHeaders,
    JsonApiNotificationChannelOut,
    JsonApiOrganizationOutMetaPermissionsEnum,
    JsonApiOrganizationPatchTypeEnum,
    JsonApiWorkspaceDataFilterInDocument,
    JsonApiWorkspaceDataFilterOutDocument,
    JsonApiWorkspaceDataFilterSettingInDocument,
    JsonApiWorkspaceDataFilterSettingOutDocument,
    JsonApiWorkspaceInDocument,
    JsonApiWorkspaceInTypeEnum,
    LayoutApiPutWorkspaceLayoutRequest,
    MetadataUtilities,
    OrganizationUtilities,
    PlatformUsage,
    ReadCsvFileManifestsResponse,
    ScanResultPdm,
    ScanSqlResponse,
    TestDefinitionRequestTypeEnum,
    UploadFileResponse,
} from "@gooddata/api-client-tiger";
import { convertApiError } from "../utils/errorHandling.js";
import uniq from "lodash/uniq.js";
import toLower from "lodash/toLower.js";
import {
    ErrorConverter,
    IAnalyticalBackend,
    isUnexpectedResponseError,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import isEmpty from "lodash/isEmpty.js";
import { AuthenticatedAsyncCall } from "@gooddata/sdk-backend-base";
import { AxiosRequestConfig } from "axios";
import { IUser } from "@gooddata/sdk-model";
import { backOff } from "exponential-backoff";

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
export type ScanResult = ScanResultPdm;

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
export type IDataSourceCacheStrategy = JsonApiDataSourceInAttributesCacheStrategyEnum;

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
    clientId?: string;
    url?: string | null;
    permissions?: IDataSourcePermission[];
    parameters?: Array<DataSourceParameter> | null;
    decodedParameters?: Array<DataSourceParameter> | null;
    cacheStrategy?: IDataSourceCacheStrategy;
    authenticationType?: JsonApiDataSourceOutAttributesAuthenticationTypeEnum;
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
    url?: string;
    username?: string;
    parameters?: Array<DataSourceParameter>;
    cacheStrategy?: IDataSourceCacheStrategy;
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
}

/**
 * @internal
 */
export interface IDataSourcePatchRequest {
    id: string;
    name?: string;
    password?: string | null;
    schema?: string;
    token?: string | null;
    type?: IDataSourceType;
    url?: string;
    username?: string;
    parameters?: Array<DataSourceParameter>;
    cacheStrategy?: IDataSourceCacheStrategy;
    privateKey?: string | null;
    privateKeyPassphrase?: string | null;
    clientId?: string | null;
    clientSecret?: string | null;
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
    username?: string;
    parameters?: Array<DataSourceParameter>;
    privateKey?: string;
    privateKeyPassphrase?: string;
    clientId?: string;
    clientSecret?: string;
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
export interface ICSPDirective {
    id: string;
    attributes: {
        /**
         * Representation values of the CSP directive entity.
         * Ex: http://a.com, *.abc.com, 'self', ..
         */
        sources: Array<string>;
    };
}

/**
 * @internal
 */
export type INotificationChannel = Omit<JsonApiNotificationChannelOut, "type">;

/**
 * @internal
 */
export interface ICustomApplicationSetting {
    id: string;
    /**
     * Name of the application the setting is applied.
     * Ex: ldmModeler
     */
    applicationName: string;
    /**
     * Representation values of the setting.
     * Ex: Layout setting of ldmModeler:  \{ "layout" : []\}
     */
    content: { [key: string]: any };
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
 * @internal
 */
export type WorkspaceDataFilterResult = JsonApiWorkspaceDataFilterOutDocument;

/**
 * @internal
 */
export type WorkspaceDataFilterSettingResult = JsonApiWorkspaceDataFilterSettingOutDocument;

/**
 * @internal
 */
export type WorkspaceDataFilter = JsonApiWorkspaceDataFilterInDocument;

/**
 * @internal
 */
export type WorkspaceDataFilterSetting = JsonApiWorkspaceDataFilterSettingInDocument;

/**
 * @internal
 */
export type ScanSqlResult = ScanSqlResponse;

/**
 * @internal
 */
export type WorkspaceEntitiesDatasets = JsonApiDatasetOutList;

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
    createDemoWorkspace?: (sampleWorkspace: WorkspaceDefinition) => Promise<string>;
    createDemoDataSource?: (sampleDataSource: DataSourceDefinition) => Promise<string>;
    createWorkspace?: (id: string, name: string, parentId?: string) => Promise<string>;
    /**
     * @deprecated use IAnalyticalBackend.workspace(id).updateDescriptor(\{ title: name \})
     */
    updateWorkspaceTitle?: (id: string, name: string) => Promise<void>;
    deleteWorkspace?: (id: string) => Promise<void>;
    canDeleteWorkspace?: (id: string) => Promise<boolean>;
    getWorkspaceLogicalModel?: (id: string, includeParents?: boolean) => Promise<DeclarativeLogicalModel>;
    getWorkspaceEntitiesDatasets?: (id: string) => Promise<WorkspaceEntitiesDatasets>;
    getEntitlements?: () => Promise<Array<Entitlement>>;
    putWorkspaceLayout?: (requestParameters: PutWorkspaceLayoutRequest) => Promise<void>;
    getAllDataSources?: () => Promise<IDataSourceConnectionInfo[]>;
    getDataSourceById?: (id: string) => Promise<IDataSourceApiResult>;
    getDataSourceIdentifierById?: (id: string) => Promise<IDataSourceApiResult>;
    createDataSource?: (requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    updateDataSource?: (id: string, requestData: IDataSourceUpsertRequest) => Promise<IDataSourceApiResult>;
    patchDataSource?: (id: string, requestData: IDataSourcePatchRequest) => Promise<IDataSourceApiResult>;
    deleteDataSource?: (id: string) => Promise<IDataSourceDeletedResponse>;
    testDataSourceConnection?: (
        connectionData: IDataSourceTestConnectionRequest,
        id?: string,
    ) => Promise<IDataSourceTestConnectionResponse>;
    publishLogicalModel?: (workspaceId: string, declarativeModel: DeclarativeLogicalModel) => Promise<void>;
    getDataSourceSchemata?: (dataSourceId: string) => Promise<string[]>;
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
    getWorkspaceDataFilter?: (workspaceId: string, objectId: string) => Promise<WorkspaceDataFilterResult>;
    setWorkspaceDataFilter?: (workspaceId: string, workspaceDataFilter: WorkspaceDataFilter) => Promise<void>;
    getWorkspaceDataFilterSetting?: (
        workspaceId: string,
        objectId: string,
    ) => Promise<WorkspaceDataFilterSettingResult>;
    setWorkspaceDataFilterSetting?: (
        workspaceId: string,
        workspaceDataFilterSetting: WorkspaceDataFilterSetting,
    ) => Promise<void>;
    getAllCSPDirectives?: () => Promise<Array<ICSPDirective>>;
    getCSPDirective?: (directiveId: string) => Promise<ICSPDirective>;
    createCSPDirective?: (requestData: ICSPDirective) => Promise<ICSPDirective>;
    updateCSPDirective?: (directiveId: string, requestData: ICSPDirective) => Promise<ICSPDirective>;
    deleteCSPDirective?: (directiveId: string) => Promise<void>;
    registerUploadNotification?: (dataSourceId: string) => Promise<void>;

    /**
     * Return all custom setting of a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param applicationName - name of the appliation the setting was set for - ex: ldmModeler
     * @returns ICustomApplicationSetting[]
     *
     */
    getWorkspaceCustomAppSettings?: (
        workspaceId: string,
        applicationName?: string,
    ) => Promise<ICustomApplicationSetting[]>;

    /**
     * Return all custom setting of a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param settingId - id of the custom setting
     * @returns ICustomApplicationSetting
     *
     */
    getWorkspaceCustomAppSetting?: (
        workspaceId: string,
        settingId: string,
    ) => Promise<ICustomApplicationSetting>;

    /**
     * Create a custom setting of a for a workspace.
     *
     * @param workspaceId - id of the workspace
     * @param applicationName - name of the appliation the setting was set for - ex: ldmModeler
     * @param content - setting data - json object
     * @example : \{"layout" : []\}
     * @param settingId - id of the custom setting, generated if not provided
     * @returns ICustomApplicationSetting
     *
     */
    createWorkspaceCustomAppSetting?: (
        workspaceId: string,
        applicationName: string,
        content: object,
        settingId?: string,
    ) => Promise<ICustomApplicationSetting>;

    /**
     * Delete a custom setting by workspace id and setting id.
     *
     * @param workspaceId - id of the workspace
     * @param settingId - id of the custom setting that should be deleted
     */
    deleteWorkspaceCustomAppSetting?: (workspaceId: string, settingId: string) => Promise<void>;

    /**
     * Get the User Entity data
     *
     * @param id - id of the current userId
     * @returns IUser
     *
     */
    getEntityUser?: (id: string) => Promise<IUser>;

    /**
     * Get metadata about SQL query
     *
     * @param dataSourceId - id of the datasource
     * @param sql - SQL query to be analyzed
     * @returns ScanSqlResult -
     *
     */
    scanSql?: (dataSourceId: string, sql: string) => Promise<ScanSqlResult>;

    /**
     * Check if entities are not overrides by entities from parents workspaces
     * @param entities - All i and types for check
     * @returns IdentifierDuplications[]
     */
    checkEntityOverrides?: (
        workspaceId: string,
        entities: Array<HierarchyObjectIdentification>,
    ) => Promise<Array<IdentifierDuplications>>;

    /**
     * Upload a CSV file to the GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     * @param file - the file to upload
     */
    stagingUpload?: (file: File) => Promise<UploadFileResponse>;

    /**
     * Analyze CSV files in GDSTORAGE data source staging location
     * @param analyzeRequest - the request to analyze CSV files
     */
    analyzeCsv?: (analyzeCsvRequest: AnalyzeCsvRequest) => Promise<Array<AnalyzeCsvResponse>>;

    /**
     * Import CSV files from GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     * @param importRequest - the request to import CSV files
     */
    importCsv?: (
        dataSourceId: string,
        importCsvRequest: ImportCsvRequest,
    ) => Promise<Array<ImportCsvResponse>>;

    /**
     * List CSV files from GDSTORAGE data source staging location
     * @param dataSourceId - id of the data source
     */
    listFiles?: (dataSourceId: string) => Promise<Array<GdStorageFile>>;

    /**
     * Delete CSV files from GDSTORAGE data source
     * @param dataSourceId - id of the data source
     * @param fileNames - names of CSV files to delete
     */
    deleteFiles?: (dataSourceId: string, fileNames: string[]) => Promise<void>;

    /**
     * Delete CSV files from GDSTORAGE data source
     * @param dataSourceId - id of the data source
     * @param fileNames - names of CSV files to delete
     */
    readFileManifests?: (
        dataSourceId: string,
        fileNames: string[],
    ) => Promise<ReadCsvFileManifestsResponse[]>;
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
    const {
        name,
        url,
        type,
        schema,
        username,
        parameters,
        decodedParameters,
        cacheStrategy,
        authenticationType,
        clientId,
    } = attributes;
    return {
        id,
        type,
        name,
        schema,
        username: username ?? undefined,
        url,
        clientId: clientId ?? undefined,
        permissions: meta?.permissions ?? [],
        parameters,
        decodedParameters,
        cacheStrategy,
        authenticationType,
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

const customAppSettingResponseAsICustomApplicationSetting = (
    response: JsonApiCustomApplicationSettingOut,
): ICustomApplicationSetting => {
    const { id, attributes } = response;
    const { applicationName, content } = attributes;
    return {
        id,
        applicationName,
        content,
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
    createDemoWorkspace: async (sampleWorkspace: WorkspaceDefinition) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.createEntityWorkspaces({
                    jsonApiWorkspaceInDocument: sampleWorkspace,
                });
                return result.data.data.id;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
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
    createWorkspace: async (id: string, name: string, parentId?: string) => {
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
                            relationships: parentId
                                ? {
                                      parent: {
                                          data: {
                                              id: parentId,
                                              type: JsonApiWorkspaceInTypeEnum.WORKSPACE,
                                          },
                                      },
                                  }
                                : undefined,
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
                await sdk.entities.patchEntityWorkspaces({
                    id,
                    jsonApiWorkspacePatchDocument: {
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
    getWorkspaceEntitiesDatasets: async (workspaceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getAllEntitiesDatasets({ workspaceId });
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
        const {
            id,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
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
                                    parameters,
                                    cacheStrategy,
                                    privateKey,
                                    privateKeyPassphrase,
                                    clientId,
                                    clientSecret,
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
        const {
            id: requestDataId,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
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
                                    parameters,
                                    cacheStrategy,
                                    privateKey,
                                    privateKeyPassphrase,
                                    clientId,
                                    clientSecret,
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
    patchDataSource: async (id: string, requestData: IDataSourcePatchRequest) => {
        const {
            id: requestDataId,
            name,
            password,
            schema,
            token,
            type,
            url,
            username,
            parameters,
            cacheStrategy,
            privateKey,
            privateKeyPassphrase,
            clientId,
            clientSecret,
        } = requestData;
        try {
            return await authApiCall(async (sdk) => {
                return sdk.entities
                    .patchEntityDataSources({
                        id,
                        jsonApiDataSourcePatchDocument: {
                            data: {
                                attributes: {
                                    name,
                                    password,
                                    schema,
                                    token,
                                    type,
                                    url,
                                    username,
                                    parameters,
                                    cacheStrategy,
                                    privateKey,
                                    privateKeyPassphrase,
                                    clientId,
                                    clientSecret,
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
                const promise = id
                    ? sdk.scanModel.testDataSource({
                          dataSourceId: id,
                          testRequest: connectionData,
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

    getWorkspaceDataFilter: async (
        workspaceId: string,
        objectId: string,
    ): Promise<WorkspaceDataFilterResult> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityWorkspaceDataFilters({
                    workspaceId,
                    objectId,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFilter: async (
        workspaceId: string,
        workspaceDataFilter: WorkspaceDataFilter,
    ): Promise<void> => {
        return authApiCall(async (sdk) => {
            await sdk.entities.createEntityWorkspaceDataFilters({
                workspaceId,
                jsonApiWorkspaceDataFilterInDocument: workspaceDataFilter,
            });
        });
    },

    getWorkspaceDataFilterSetting: async (
        workspaceId: string,
        objectId: string,
    ): Promise<WorkspaceDataFilterSettingResult> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityWorkspaceDataFilterSettings({
                    workspaceId,
                    objectId,
                });
                return result.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    setWorkspaceDataFilterSetting: async (
        workspaceId: string,
        workspaceDataFilterSetting: WorkspaceDataFilterSetting,
    ): Promise<void> => {
        return await authApiCall(async (sdk) => {
            await sdk.entities.createEntityWorkspaceDataFilterSettings({
                workspaceId,
                jsonApiWorkspaceDataFilterSettingInDocument: workspaceDataFilterSetting,
            });
        });
    },

    getAllCSPDirectives: async (): Promise<Array<ICSPDirective>> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getAllEntitiesCspDirectives({});
                return result.data?.data || [];
            });
        } catch (error) {
            return [];
        }
    },
    getCSPDirective: async (directiveId: string): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityCspDirectives({ id: directiveId });
                return result.data?.data;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    createCSPDirective: async (requestData: ICSPDirective): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const jsonApiCspDirectiveInDocument: JsonApiCspDirectiveInDocument = {
                    data: {
                        id: requestData.id,
                        type: JsonApiCspDirectiveInTypeEnum.CSP_DIRECTIVE,
                        attributes: requestData.attributes,
                    },
                };
                const result = await sdk.entities.createEntityCspDirectives({
                    jsonApiCspDirectiveInDocument,
                });

                return result.data?.data;
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
    updateCSPDirective: async (directiveId: string, requestData: ICSPDirective): Promise<ICSPDirective> => {
        try {
            return await authApiCall(async (sdk) => {
                const jsonApiCspDirectiveInDocument: JsonApiCspDirectiveInDocument = {
                    data: {
                        id: requestData.id,
                        type: JsonApiCspDirectiveInTypeEnum.CSP_DIRECTIVE,
                        attributes: requestData.attributes,
                    },
                };
                const result = await sdk.entities.updateEntityCspDirectives({
                    id: directiveId,
                    jsonApiCspDirectiveInDocument,
                });

                return result.data?.data;
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
    deleteCSPDirective: async (directiveId: string) => {
        try {
            await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityCspDirectives({ id: directiveId });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
    getWorkspaceCustomAppSettings: async (workspaceId: string, applicationName?: string) => {
        return await authApiCall(async (sdk) => {
            const result = await sdk.entities.getAllEntitiesCustomApplicationSettings({
                workspaceId,
            });
            const responseData = result.data;
            if (applicationName) {
                responseData.data = responseData.data.filter(
                    (setting) => setting.attributes.applicationName === applicationName,
                );
            }
            return responseData.data.map((setting) =>
                customAppSettingResponseAsICustomApplicationSetting(setting),
            );
        });
    },
    getWorkspaceCustomAppSetting: async (workspaceId: string, settingId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityCustomApplicationSettings({
                    objectId: settingId,
                    workspaceId,
                });
                return customAppSettingResponseAsICustomApplicationSetting(result.data.data);
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    createWorkspaceCustomAppSetting: async (
        workspaceId: string,
        applicationName: string,
        content: object,
        settingId?: string,
    ) => {
        return await authApiCall(async (sdk) => {
            const result = await sdk.entities.createEntityCustomApplicationSettings({
                workspaceId,
                jsonApiCustomApplicationSettingPostOptionalIdDocument: {
                    data: {
                        type: JsonApiCustomApplicationSettingOutTypeEnum.CUSTOM_APPLICATION_SETTING,
                        id: settingId,
                        attributes: {
                            applicationName,
                            content,
                        },
                    },
                },
            });
            return customAppSettingResponseAsICustomApplicationSetting(result.data.data);
        });
    },

    deleteWorkspaceCustomAppSetting: async (workspaceId: string, settingId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.entities.deleteEntityCustomApplicationSettings({
                    objectId: settingId,
                    workspaceId,
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    getEntityUser: async (id: string) => {
        try {
            return await authApiCall(async (sdk) => {
                const result = await sdk.entities.getEntityUsers({
                    id,
                });
                const { firstname, lastname, ...userInfo } = result.data?.data.attributes || {};
                return {
                    ...userInfo,
                    firstName: firstname,
                    lastName: lastname,
                } as IUser;
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    registerUploadNotification: async (dataSourceId: string) => {
        return await authApiCall(async (sdk) => {
            await sdk.actions.registerUploadNotification({
                dataSourceId,
            });
        });
    },

    scanSql: async (dataSourceId: string, sql: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.scanModel.scanSql({ dataSourceId, scanSqlRequest: { sql } }).then((response) => {
                    return response.data as ScanSqlResult;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    checkEntityOverrides: async (
        workspaceId: string,
        hierarchyObjectIdentification: Array<HierarchyObjectIdentification>,
    ) => {
        try {
            return await authApiCall(async (sdk) => {
                return sdk.actions
                    .checkEntityOverrides({ workspaceId, hierarchyObjectIdentification })
                    .then((response) => {
                        return response.data as Array<IdentifierDuplications>;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    stagingUpload: async (file: File): Promise<UploadFileResponse> => {
        /*
         * Since the upload API has some rate limiting in place, we need to retry the upload in case of 503 errors.
         * To make the retries more efficient, we use exponential backoff with jitter so as not to overload the API.
         * On any other error, we throw the error right away: no retries there.
         */

        const body = async () =>
            await authApiCall(async (sdk) => {
                return await sdk.result
                    .stagingUpload({
                        file,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });

        try {
            return backOff(body, {
                // add some randomness to the delay to avoid all clients retrying at the same time
                jitter: "full",
                // retry at most 3 times
                numOfAttempts: 3,
                // wait 1s before the first retry
                startingDelay: 1000,
                // but never wait more than 4s
                maxDelay: 4000,
                // retry only on 503 errors, on this API this means that the API is overloaded
                retry: (e, _attempt) => {
                    const converted = convertApiError(e);
                    if (isUnexpectedResponseError(converted)) {
                        return converted.httpStatus === 503;
                    }
                    return false;
                },
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    analyzeCsv: async (analyzeCsvRequest: AnalyzeCsvRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.result
                    .analyzeCsv({
                        analyzeCsvRequest: analyzeCsvRequest,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    importCsv: async (dataSourceId: string, importCsvRequest: ImportCsvRequest) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.result
                    .importCsv({
                        dataSourceId: dataSourceId,
                        importCsvRequest: importCsvRequest,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    listFiles: async (dataSourceId: string) => {
        try {
            return await authApiCall(async (sdk) => {
                return await sdk.result
                    .listFiles({
                        dataSourceId: dataSourceId,
                    })
                    .then((res) => {
                        return res?.data;
                    });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    deleteFiles: async (dataSourceId: string, fileNames: string[]) => {
        try {
            return await authApiCall(async (sdk) => {
                await sdk.result.deleteFiles({
                    dataSourceId: dataSourceId,
                    deleteFilesRequest: {
                        fileNames: fileNames,
                    },
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },

    readFileManifests: async (dataSourceId, fileNames) => {
        try {
            return await authApiCall(async (sdk) => {
                const request: ActionsApiReadCsvFileManifestsRequest = {
                    dataSourceId: dataSourceId,
                    readCsvFileManifestsRequest: {
                        manifestRequests: fileNames.map((fileName) => ({
                            fileName,
                        })),
                    },
                };
                return await sdk.result.readCsvFileManifests(request).then((res) => {
                    return res?.data;
                });
            });
        } catch (error: any) {
            throw convertApiError(error);
        }
    },
});
